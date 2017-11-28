import React, { Component } from 'react';
import JSURL from 'jsurl'
import Editor from './Editor'

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
  constructor(props) {
    super(props)

    let values = []

    if (window.location.hash) {
      const withoutHash = window.location.hash.slice(1)
      const parsedWithJSURL = JSURL.tryParse(withoutHash)

      values = parsedWithJSURL
        ? parsedWithJSURL
        : withoutHash.split(',').map(undecoded => decodeURIComponent(undecoded))
    }

    this.state = {
      values,
      results: [],
      runFromIndex: null,
    }

    window.state = this.state
    window.updateResults = this.updateResults.bind(this)
  }

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
    // if (this.props.userCode.runFromIndex !== nextProps.userCode.runFromIndex && nextProps.userCode.runFromIndex !== null) {
    //   document.getElementById('run-button').click();
    // }
  }

  generateUrl = (values, isJSURL = false) => {
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

  displayNumberOfCharacters = values => values.join('').length

  onFileUpload = event => {
    const reader = new FileReader();
    reader.onload = this.onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }

  onReaderLoad = event => {
    const object = JSON.parse(event.target.result)
    if (!object) {
      return alert('Please check format of file')
    }
    const { cells } = object

    if (Array.isArray(cells)) {
      cells.forEach((cell, i) => this.onCodeChange(cell.source.join(''), i))
    }
  }

  downloadFile = values => {
    const file = this.generateFile(values)
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(file));
    element.setAttribute('download', 'Untitled.ipynb');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  generateFile = values => {
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

  onCodeChange = (value, index) => {
    const { isOwnState, updateCode } = this.props

    if (isOwnState) {
      this.setState({
        values: [
          ...this.state.values.slice(0, index),
          value,
          ...this.state.values.slice(index + 1)
        ]
      }, (state) => {window.state = state})
    }

    if (updateCode) {
      updateCode(value, index)
    }
  }
    

  onIndexChange = index => {
    const { isOwnState = false, updateIndex } = this.props

    if (isOwnState) {
      this.setState({runFromIndex: index}, () => {
        window.state = this.state
        document.getElementById('run-button').click();
      })
    }

    if (updateIndex) {
      updateIndex(index)
    }
  }

  updateResults = (value, index) => {
    this.setState( state => ({
        results: [
          ...state.results.slice(0, index),
          value,
          ...state.results.slice(index + 1)
        ],
        runFromIndex: null
      })
    )

    const { updateResults } = this.props

    if (updateResults) {
      updateResults(value, index)
    }
  }

  render() {
    const { isOwnState = false } = this.props

    let { values, results } = this.state
    let updateCodeFn = this.onCodeChange

    if (!isOwnState && this.props.userCode) {
      values = this.props.userCode.values
      results = this.props.userCode.results
    }

    const codeLength = this.displayNumberOfCharacters(values)

    return (
      <div className="container">
        {Array.from(Array(numberOfInputs).keys()).map(number =>
          <Editor
            value={values[number]}
            result={results[number]}
            onChange={value => this.onCodeChange(value, number)}
            index={number}
            key={number}
            onRun={() => this.onIndexChange(number)}
            runAll={() => this.onIndexChange(numberOfInputs - 1)} />
        )}
        <p>Number of characters: {codeLength}</p>
        <button disabled={codeLength > 2000} onClick={() => this.generateUrl(values, false)}>Generate url with code</button>
        <button disabled={codeLength > 2000} onClick={() => this.generateUrl(values, true)}>Generate url with JSURL</button>
        <button onClick={() => this.downloadFile(values)}>Download .ipynb</button>
        <button>
          <label htmlFor="file-upload" style={{display: 'inherit', marginBottom: '0', fontWeight: '400'}}>
            Upload file
          </label>
        </button>
        <input id="file-upload" type="file" onChange={this.onFileUpload} style={{display: 'none'}} />
      </div>
    )
  }
}

export default CodeApp
