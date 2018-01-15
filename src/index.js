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

ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/');

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
); 
