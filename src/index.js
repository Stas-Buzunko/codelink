import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ace from 'brace';
import AceEditor from 'react-ace'
import 'brace/mode/python';
import 'brace/mode/jsx';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import { createStore, combineReducers, applyMiddleware } from 'redux'
import JSURL from 'jsurl'
import logger from 'redux-logger'


// import 'brace/theme/github';
// import './css/bootstrap.min.css'
// import './css/doc_brython.css'
// import './css/console.css'
// import './css/ace.css'
// import './index.css';
// import App from './App';

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
// window.define = ace.define
const userCode = (state = initialState, action) => {
  switch(action.type){
    case('UPDATE_CODE'):    
      return {
        ...state,
        values: [
          ...state.values.slice(0, action.index),
          action.value,
          ...state.values.slice(action.index + 1)
        ]
      }
    case('UPDATE_INDEX'):
      return {
        ...state,
        runFromIndex: action.index
      }
    case('UPDATE_RESULTS'):
      return {
        ...state,
        results: [
          ...state.results.slice(0, action.index),
          action.value,
          ...state.results.slice(action.index + 1)
        ],
        runFromIndex: null
      }
    default:
      return state;
  }  
};
const editorApp = combineReducers({
  userCode:userCode
})

window.store = createStore(editorApp, applyMiddleware(logger));
const store = window.store

ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/');

const Editor = ({ onRun, index, onChange, value = '', result, runAll }) => (
  <div className="col-lg-12" style={{marginTop: '20px'}}>
    <div className="col-lg-6">
      <div className="row">
        <div className="editor" style={{width: '100%'}}>
          <AceEditor
            mode="python"
            // theme=""
            value={value}
            onChange={onChange}
            editorProps={{$blockScrolling: true}}
            minLines={1}
            maxLines={value.split(/\r\n|\r|\n/).length}
            showLineNumbers={false}
            commands={[{   // commands is array of key bindings.
              name: 'executeCode', //name for the key binding.
              bindKey: { win: 'Shift-Enter', mac: 'Shift-Enter' }, //key combination used for the command.
              exec: runAll  //function to execute when keys are pressed.
            }]}
          />
        </div>
      </div>
      <div className="row" style={{padding: 0, marginTop: '10px'}}>
        <div className="col-lg-8" style={{paddingLeft: 0}}>
          <pre id={`editor-result-${index}`} style={{height: '100%'}}>
            {result}
          </pre>
        </div>
        <div className="col-lg-4">
          <button
            className="btn btn-success"
            onClick={onRun}
          >
            Run All Above
          </button>
        </div>
      </div>
    </div>            
  </div>
)

const numberOfInputs = 2

const template = {
  "cells": [],
  "metadata": {
   "kernelspec": {
      "display_name": "Python 3",
      "language": "python",
      "name": "python3"
    },
    "language_info": {
      "codemirror_mode": {
        "name": "ipython",
        "version": 3
      },
      "file_extension": ".py",
      "mimetype": "text/x-python",
      "name": "python",
      "nbconvert_exporter": "python",
      "pygments_lexer": "ipython3",
      "version": "3.6.2"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
}

class CodeApp extends Component {
  componentWillMount () {
    const script = document.createElement("script");

    script.async = true;
    script.type = 'text/python3';
    script.innerHTML = `
from browser import document as doc, window
from browser import html
import editor

doc['run-button'].bind('click', editor.run)
`

    document.body.appendChild(script);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.userCode.runFromIndex !== nextProps.userCode.runFromIndex && nextProps.userCode.runFromIndex !== null) {
      document.getElementById('run-button').click();
    }
  }

  onRun = index => {
    store.dispatch({ type: 'UPDATE_INDEX', index });
  }

  onChange = (value, index) => {
    store.dispatch({ value, type: 'UPDATE_CODE', index });
  }

  generateUrl = (isJSURL = false) => {
    const { values } = this.props.userCode
    const allCode = values.join('')

    if (allCode.length > 2000) {
      return alert('You can encode up to 2000 symbols')
    }
    let encoded

    const filteredCode = values.filter(value => value)

    if (isJSURL) {
      encoded = JSURL.stringify(filteredCode)
    } else {
      encoded = filteredCode.map((value, i) => encodeURIComponent(value)).join(',')
    }

    window.location.hash = encoded
  }

  displayNumberOfCharacters = () => {
    const { values } = this.props.userCode
    const allCodeString = values.join('')

    return allCodeString.length
  }

  onFileUpload = event => {
    const reader = new FileReader();
    reader.onload = this.onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }

  onReaderLoad = (event) => {
    const object = JSON.parse(event.target.result)
    if (!object) {
      return alert('Please check format of file')
    }
    const { cells } = object

    if (Array.isArray(cells)) {
      cells.forEach((cell, i) => this.onChange(cell.source.join(''), i))
    }
  }

  downloadFile = () => {
    const file = this.generateFile()
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(file));
    element.setAttribute('download', 'Untitled.ipynb');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  generateFile = () => {
    const { values } = this.props.userCode

    template.cells = values.map(value => ({
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "outputs": [],
      "source": [
        value
      ]
    }))

    return template
  }

  render() {
    const { values, results } = this.props.userCode

    return (
      <div className="container">
        <h3>Upload a file to read in data</h3>
        <p>File should </p>
        <input id="file" type="file" onChange={this.onFileUpload} />
        {Array.from(Array(numberOfInputs).keys()).map(number =>
          <Editor
            value={values[number]}
            result={results[number]}
            onChange={value => this.onChange(value, number)}
            index={number}
            key={number}
            onRun={() => this.onRun(number)}
            onStop={() => this.setState({ isRunning: false })}
            runAll={() => this.onRun(numberOfInputs - 1)} />
        )}
        <p>Number of characters: {this.displayNumberOfCharacters()}</p>
        <button onClick={() => this.generateUrl(false)}>Generate url with code</button>
        <button onClick={() => this.generateUrl(true)}>Generate url with JSURL</button>
        <button onClick={this.downloadFile}>Download .ipynb</button>
      </div>
    )
  }
}

const render = () => {  
 ReactDOM.render(
    <CodeApp 
       {...store.getState()}
     />,
    document.getElementById('root')
 ); 
};

store.subscribe(render);
render();