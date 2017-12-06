import React from 'react';
import ReactDOM from 'react-dom';
import ace from 'brace';
import 'brace/mode/python';
import 'brace/mode/markdown';
import { Provider } from 'react-redux'
import App from './App'
import { login, updateIndex, updateCode, updateResults, updateMarkdown } from './actions'
import store from './store'

// uncomment next line when use showModelSolution
// window.showModelSolution = true

// we need this to make python able read from store
window.store = store

ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/');

const { firebase } = store

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const { uid, isAnonymous } = user
    // User is signed in.

    firebase.database().ref('Logs').push(`Anonymous user ${uid} has been logged in.`)
    store.dispatch(login(uid, isAnonymous))
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
    <App
      updateResults={(value, index) => store.dispatch(updateResults(value, index))}
      updateIndex={index => store.dispatch(updateIndex(index))}
      updateCode={(value, index) => store.dispatch(updateCode(value, index))}
      updateMarkdown={(value, index) => store.dispatch(updateMarkdown(value, index))}
      userCode={store.getState().userCode}
      hideButtons={false}
      readOnlyTests={false}
    />
  </Provider>,
  document.getElementById('root')
); 
