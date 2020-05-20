import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import history from './util/history';
import App from './App';
import * as serviceWorker from './serviceWorker';

import store from './redux/store';
import { Provider, useSelector } from 'react-redux';

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore' // <- needed if using firestore
import firebaseConfig from './util/firebaseConfig.json'
import { ReactReduxFirebaseProvider, isLoaded } from 'react-redux-firebase'
import { createFirestoreInstance } from 'redux-firestore' // <- needed if using firestore

import { SnackbarProvider, useSnackbar } from 'notistack';

// react-redux-firebase config
const rrfConfig = {
  userProfile: 'users',
	useFirestoreForProfile: true, //Firestore for Profile instead of Realtime DB
	presence: 'presence', // where list of online users is stored in database
  sessions: 'sessions' // where list of user sessions is stored in database (presence must be enabled)
}

// Initialize firebase instance
firebase.initializeApp(firebaseConfig)

// Initialize other services on firebase instance
 firebase.firestore() // <- needed if using firestore

const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance // <- needed if using firestore
}

const SnackBarComponent = () => {
	const { enqueueSnackbar } = useSnackbar();
	
	useSelector( state => {
		var uiState = state.UI;
		if(uiState.snackBar != null && uiState.snackBar.length > 0){
			uiState.snackBar.forEach(error => {
				enqueueSnackbar(error.message, { variant: error.type,})
			})
		}
  });

  return (
    <></>
  );
}

ReactDOM.render(
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <Router history={history}>
          <SnackbarProvider>
            <SnackBarComponent/>
            <App />
          </SnackbarProvider>
        </Router>
      </ReactReduxFirebaseProvider>
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();