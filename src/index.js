import React from 'react';
import ReactDOM from 'react-dom';
import ace from 'brace';
import 'brace/mode/python';
import 'brace/mode/markdown';
import { Provider } from 'react-redux'
import App from './App'
import store from './store'
import './index.css'

// uncomment next line when use showModelSolution
// refactor this later
// window.showModelSolution = true

// 1. Assignment attempts (each time a user tries to solve a problem with the time attempted)
// 2. When assignment is solved. 
// 4. When an assignment is "opened" or made visible (assuming the problem was closed at some point).
// This will be sort of a starting time for people to attempt the assignment. 

// My initial thought was to just log all the Redux updates using some standard
// process and then filter out the ones that we didn't want logged to Firebase.
// That might be easier and involve writing less code.

ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/');

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
); 
