import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux'
import store from './store'
import * as Firebase from 'firebase'

global.fbConfig = {
  apiKey: 'asdf', // placeholder
  authDomain: 'asdf', // placeholder
  databaseURL: 'ws://127.0.1:5000',
  storageBucket: 'asdf', // placeholder
  messagingSenderId: 'asdf' // placeholder
}

global.Firebase = Firebase
global.console = {
  log: () => {},
  error: () => {}
}
global.localStorage = {
  getItem: () => {},
  removeItem: () => {}
}

// Swallow firebase reinitialize error (useful when using watch)
try {
  Firebase.initializeApp(fbConfig)
} catch (err) {}

global.firebase = Object.defineProperty(Firebase, '_', {
  value: {
    watchers: {},
    authUid: null,
    config: Object.assign(
      {},
      fbConfig,
      {
        userProfile: 'users',
        enableRedirectHandling: false // disabled due to lack of http/https
      }
    )
  },
  writable: true,
  enumerable: true,
  configurable: true
})

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, div);
});
