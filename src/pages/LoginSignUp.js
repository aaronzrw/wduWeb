import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import _ from 'lodash';
import AppIcon from '../media/WDU.gif';
import { Link } from 'react-router-dom';
import firebase from 'firebase/app'
import 'firebase/auth'

import {
    SET_USER,
    SET_SNACKBAR,
    CLEAR_ERRORS,
    LOADING_UI,
    SET_UNAUTHENTICATED,
    LOADING_USER,
    UPDATE_SUBMIT_COUNT,
    UNSUB_SNAPSHOTS,
  } from '../redux/types';

import { loginUser, signupUser, validateLoginData, validateSignUpData } from '../redux/actions/userActions'

// MUI Stuff
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

//Labs
import MuiAlert from '@material-ui/lab/Alert';

// Redux stuff
import watch from 'redux-watch'
import { connect, useSelector } from 'react-redux';
import store from '../redux/store';

const styles = (theme) => ({
	...theme.spreadThis
});

export class LoginSignUp extends Component {
    constructor() {
    super();
		this.state = {
			loading: store.getState().UI.loading,
			loginOpen: true,
			email: '',
			password: '',
			confirmPassword: '',
			userName: '',
			pin: '',
			errors: {},
		};

		this.toggleView = this.toggleView.bind(this);
		
		let uiReducerWatch = watch(store.getState, 'UI')
		store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({loading: newVal.loading })
		}))
    }
  
    componentWillReceiveProps(nextProps) {
	}

    userNameLoginSubmit = (event) => {
        event.preventDefault();
        const userData = {
            email: this.state.email,
            password: this.state.password
		};
		const { valid, errors } = validateLoginData(userData);
		if (!valid){
		  console.log(errors)
		  store.dispatch({
			type: SET_SNACKBAR,
			payload: errors
		  });
		  return;
		}
	
		firebase.firestore().collection("users").where("email", "==", userData.email).get()
		.then((data) => {
		  if(data.empty){
			throw new Error("No Account Exists")
		  }
	
		  return firebase.auth().signInWithEmailAndPassword(userData.email, userData.password)
		})
		.then(async (data) => {
		  var uid = await firebase.auth().currentUser.uid;
		  var userRec = await firebase.firestore().doc(`/users/${uid}`).get();
	
		  if(!userRec.data().isActive){
			throw new Error("This Account Is Not Active")
		  }
		})
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
        //this.props.loginUser(userData);
    }
    
    userNameSignUpSubmit = async (event) => {
        event.preventDefault();
        this.setState({
			loading: true
        });

        if(this.state.pin.length < 4){
            //error pin needs to be 4 numbers long
            var errorsTemp = this.state.errors;
            errorsTemp.pin = "Pin must be atleast 4 digits long";

            this.setState({ errors: errorsTemp, loading: false })
            return;
        }

        const newUserData = {
            email: this.state.email,
            password: this.state.password,
            confirmPassword: this.state.confirmPassword,
            userName: this.state.userName,
            pin: this.state.pin
		};
		
		
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
		  var idToken = data.user.getIdToken();
		  return idToken;
		})
		.then((idToken) => {
		  token = idToken;
		  const userCreds = {
				userName: newUserData.userName,
				email: newUserData.email,
				img: `https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/no-img.png?alt=media`,
				createdDate: new Date(),
				isAdmin: false,
				isWinner: false,
				points: 5,
				statCoins: 0,
				rankCoins: 0,
				submitSlots: 0,
				isActive: true,
				pin: newUserData.pin
		  };
	
		  return firebase.firestore().doc(`/users/${userId}`).set(userCreds);
		})
		.then(() => {
			store.dispatch({
				type: SET_SNACKBAR,
				payload: [{ type: "success", message:'Your Account Has Been Created' }]
			});
			this.setState({
				loading: store.getState().UI.loading,
				loginOpen: true,
				email: '',
				password: '',
				confirmPassword: '',
				userName: '',
				pin: '',
				errors: {},
			})
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
    }

    userNameChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }
  
    userNamePinChange = (event) => {
        var letters = /^[A-Za-z]+$/;
        if(event.target.value.match(letters)){
            //Pin can only have numbers        
            var errors = this.state.errors;
            errors.pin = "Pin can only contain numbers";

            this.setState({ errors, loading: false })
            return;
        }

        this.setState({
            pin: event.target.value
        });
    }   

    toggleView(){
			this.setState({ loginOpen: !this.state.loginOpen});
	}
	
	closeSnackBar(){
		this.setState({showSB: false})
	}

    render() {
			const { classes } = this.props;
			return (
				<div style={{ width: "100%", height: "100%"}}>
					{
						this.state.loginOpen ?
						<> {/* Login */}
								<Grid container className={classes.form}>
										<Grid item sm />
										<Grid item sm>
												{/* <img src={AppIcon} alt="monkey" className={classes.image} /> */}
												<Typography variant="h2" className={classes.pageTitle}>
														Login
												</Typography>

												<TextField
														id="email"
														name="email"
														type="email"
														label="Email"
														className={classes.textField}
														value={this.state.email}
														onChange={this.userNameChange}
														fullWidth
												/>
												<TextField
														id="password"
														name="password"
														type="password"
														label="Password"
														className={classes.textField}
														value={this.state.password}
														onChange={this.userNameChange}
														fullWidth
												/>
												<Button
														type="submit"
														variant="contained"
														color="primary"
														className={classes.button}
														disabled={this.state.loading}
														onClick={ this.userNameLoginSubmit }
												>
														Login
														{this.state.loading && (
																<CircularProgress size={30} className={classes.progress} />
														)}
												</Button>
												<br />
												<small>
														Dont have an account ? sign up <Button variant="outlined" color="primary" onClick={ this.toggleView }>here</Button>
												</small>
										</Grid>
										<Grid item sm />
								</Grid>
						</>
						:
						<> {/*Sign Up*/}
									<Grid container className={classes.form}>
											<Grid item sm />
											<Grid item sm>
													{/* <img src={AppIcon} alt="monkey" className={classes.image} /> */}
													<Typography variant="h2" className={classes.pageTitle}>
															SignUp
													</Typography>
													<TextField
															id="email"
															name="email"
															type="email"
															label="Email"
															className={classes.textField}
															value={this.state.email}
															onChange={this.userNameChange}
															fullWidth
													/>
													<TextField
															id="password"
															name="password"
															type="password"
															label="Password"
															className={classes.textField}
															value={this.state.password}
															onChange={this.userNameChange}
															fullWidth
													/>
													<TextField
															id="confirmPassword"
															name="confirmPassword"
															type="password"
															label="Confirm Password"
															className={classes.textField}
															value={this.state.confirmPassword}
															onChange={this.userNameChange}
															fullWidth
													/>
													<TextField
															id="userName"
															name="userName"
															type="text"
															label="UserName"
															className={classes.textField}
															value={this.state.userName}
															onChange={this.userNameChange}
															fullWidth
													/>
													<TextField
															id="pin"
															name="pin"
															type="text"
															label="Pin"
															className={classes.textField}
															value={this.state.pin}
															onChange={this.userNamePinChange}
															fullWidth
													/>
													<Button
															type="submit"
															variant="contained"
															color="primary"
															className={classes.button}
															disabled={this.state.loading}
															onClick={ this.userNameSignUpSubmit }
													>
															SignUp
															{this.state.loading && (
																<CircularProgress size={30} className={classes.progress} />
															)}
													</Button>
													<br />
													<small>
															Already have an account ? Login <Button variant="outlined" color="primary" onClick={ this.toggleView }>here</Button>
													</small>
											</Grid>
											<Grid item sm />
									</Grid>
							</>
					}
				</div>
			)
    }
}


LoginSignUp.propTypes = {
    classes: PropTypes.object.isRequired,
	loginUser: PropTypes.func.isRequired,
	signupUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
};
  
const mapStateToProps = (state) => ({
	user: state.user
});
  

const mapActionsToProps = {
	loginUser,
	signupUser
};
  
export default connect(
	mapStateToProps,
	mapActionsToProps
)(withStyles(styles)(LoginSignUp));
