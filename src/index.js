import React from 'react';
import ReactDOM from 'react-dom';
import ace from 'brace';
import 'brace/mode/python';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import JSURL from 'jsurl'
import logger from 'redux-logger'
import { Provider } from 'react-redux'
import { reactReduxFirebase, firebaseStateReducer } from 'react-redux-firebase'
import App from './App'
import userCode from './userCodeReducer'

const firebaseConfig = {
  apiKey: "AIzaSyCoYrHhHNmZPbQUrH2SiStUAcigh69Cg0A",
  authDomain: "test-5eae3.firebaseapp.com",
  databaseURL: "https://test-5eae3.firebaseio.com",
  projectId: "test-5eae3",
  storageBucket: "test-5eae3.appspot.com",
  messagingSenderId: "133800159142"
}

const reduxFirebaseConfig = { userProfile: 'users' }

// Add reactReduxFirebase store enhancer
const createStoreWithFirebase = compose(
  reactReduxFirebase(firebaseConfig, reduxFirebaseConfig),
)(createStore)

let values = []

if (window.location.hash) {
  const withoutHash = window.location.hash.slice(1)
  const parsedWithJSURL = JSURL.tryParse(withoutHash)

  values = parsedWithJSURL
    ? parsedWithJSURL
    : withoutHash.split(',').map(undecoded => decodeURIComponent(undecoded))
}

const initialState = {
  values,
  runFromIndex: null,
  results: []
}

// Add firebase to reducers
const rootReducer = combineReducers({
  firebase: firebaseStateReducer,
  userCode
})

// Create store with reducers and initial state
const store = createStoreWithFirebase(
  rootReducer,
  {
    userCode: initialState
  },
  applyMiddleware(logger)
)

// we need this to make python able read from store
window.store = store

ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/');

const { firebase } = store

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const { uid } = user
    // User is signed in.

    firebase.database().ref('Logs').push(`Anonymous user ${uid} has been logged in. `)
  } else {
    // if not signed in, then log in him
    firebase.auth().signInAnonymously()
    .catch(error => {
      const { code: errorCode, message: errorMessage } = error
      // Handle Errors here.

      console.log(errorCode, errorMessage)
    });
  }
});


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
); 
