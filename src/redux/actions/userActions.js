import React from 'react'
import {
    SET_USER,
    SET_SNACKBAR,
    CLEAR_ERRORS,
    LOADING_UI,
    SET_UNAUTHENTICATED,
    LOADING_USER,
    UPDATE_SUBMIT_COUNT,
    UNSUB_SNAPSHOTS,
  } from '../types';
  import axios from 'axios';
  import { browserHistory } from 'react-router'

  import { useSelector } from 'react-redux'
  import { useFirebase } from 'react-redux-firebase'
  import firebase from 'firebase/app'
  import 'firebase/auth'
  import { setRealTimeListeners } from './dataActions'
  import {verifyToken} from '../../util/fbAuth';
  import history from '../../util/history';
  import store from '../store';

  export const loginUser = (user) => {
    const { valid, errors } = validateLoginData(user);
    if (!valid){
      console.log("error logging in")
      console.log(errors)
      store.dispatch({
        type: SET_SNACKBAR,
        payload: errors
      });
      return;
    }

    firebase.firestore().collection("users").where("email", "==", user.email).get()
    .then((data) => {
      if(data.empty){
        throw new Error("No Account Exists")
      }

      return firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    })
    .then(async (data) => {
      var uid = await firebase.auth().currentUser.uid;
      var userRec = await firebase.firestore().doc(`/users/${uid}`).get();

      if(!userRec.data().isActive){
        throw new Error("This Account Is Not Active")
      }
      else{
        return data.user.getIdToken();
      }
    })
/*     .then((token) => {
      getUserData(token);
    }) */
    .catch((err) => {
      console.log(err.code);
      var errors = [];

      if (err.code === 'auth/wrong-password')
        errors.push({type:"error", message:'Wrong login details, please try again'})
      else
        errors.push({type:"error", message: err.message});

      store.dispatch({
        type: SET_SNACKBAR,
        payload: errors
      });
    })
  };
  
  export const signupUser = (newUserData) => {
    const { valid, errors } = validateSignUpData(newUserData);
    if (!valid){
      var errorList = [];
      errors.forEach(x => {
        errorList.push({type: "error", message: x})
      })

      store.dispatch({
        type: SET_SNACKBAR,
        payload: errorList
      });
      return;
    }

    let token, userId;
    firebase.auth().createUserWithEmailAndPassword(newUserData.email, newUserData.password)
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCreds = {
        userName: newUserData.userName,
        email: newUserData.email,
        img: `https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/no-img.png?alt=media`,
        createdDate: new Date().toISOString(),
        isAdmin: false,
        isWinner: false,
        points: 10,
        statCoins: 0,
        rankCoins: 0,
        submitSlots: 0,
        isActive: false,
        pin: newUserData.pin
      };

      return firebase.firestore().doc(`/users/${userId}`).set(userCreds);
    })
    .then(() => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "success", message:'Your Account Has Been Created But Must Be Approved!' }]
      });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "error", message:'Email is already in use' }]
        });
      }
      else {
        store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "error", message: err.code }]
        });
      }
    });
  };
  
  export const logoutUser = () => {
    localStorage.removeItem('authUser');
    delete axios.defaults.headers.common['Authorization'];
    firebase.auth().signOut()
    store.dispatch({ type: SET_SNACKBAR, payload: [{type: "info", message: "You Have Been Logged Out"}]})
  };
  
  export function getUserData(token){
    store.dispatch({ type: LOADING_USER });
    setAuthorizationHeader(token);
    setRealTimeListeners()
/*     verifyToken()
    .then(() => {
      store.dispatch({ type: LOADING_USER });
      setRealTimeListeners()
    })
    .catch(err => {
      logoutUser()
    }) */
  };
    
  export const editUserDetails = (userDetails) => (dispatch) => {
    store.dispatch({ type: LOADING_USER });
    axios
      .post('/user', userDetails)
      .then(() => {
        store.dispatch(getUserData());
      })
      .catch((err) => console.log(err));
  };
  
  export const validateLoginData = (data) => {
    let errors = [];

    if (isEmpty(data.email)) errors.push({type:"error", message: 'Email Must not be empty'});
    if (isEmpty(data.password)) errors.push({type:"error", message: 'Password Must not be empty'});

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
  }

  export const validateSignUpData = (data) => {
    let errors = [];
    if (isEmpty(data.email))
      errors.push('Must not empty')
    else if (!isEmail(data.email))
      errors.push('Must be a valid email address')

    if (isEmpty(data.password))
      errors.push('Must not empty')
    if (data.password !== data.confirmPassword)
      errors.push('Passwords must match')

    if (isEmpty(data.userName))
      errors.push('Must not empty')

    if (isEmpty(data.pin))
      errors.push('Must not empty')

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
  }

  const isEmpty = (string) => {
    if (string.trim() == '') return true;
    else return false;
  };

  const isEmail = (email) => {
      const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (email.match(regEx)) return true;
      else return false;
  };

  
const setAuthorizationHeader = (token) => {
  const FBIdToken = `Bearer ${token}`;
  localStorage.setItem('FBIdToken', FBIdToken);
  axios.defaults.headers.common['Authorization'] = FBIdToken;
};
