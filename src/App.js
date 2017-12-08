import React, { Component } from 'react';
import JSURL from 'jsurl'
import Editor from './Editor'

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

    const numberOfInputs = props.showModelSolution ? 3 : 2

    let values = []
    let markdownValues = []

    for (let i = numberOfInputs; i > 0; i--) {
      markdownValues.push('')
      values.push('')
    }

    const { hash } = window.location

    if (hash) {
      const withoutHash = hash.slice(1)
      const parsedWithJSURL = JSURL.tryParse(withoutHash)

      if (parsedWithJSURL) {
        if (parsedWithJSURL.code) {
          if (props.showModelSolution) {
            values = [
              ...parsedWithJSURL.code.slice(0,1),
              '',
              ...parsedWithJSURL.code.slice(1)
            ]
          } else {
            values = parsedWithJSURL.code
          }
        }

        if (parsedWithJSURL.markdown) {
          if (props.showModelSolution) {
            markdownValues = [
              ...parsedWithJSURL.markdown.slice(0,1),
              '',
              ...parsedWithJSURL.markdown.slice(1)
            ]
          } else {
            markdownValues = parsedWithJSURL.markdown
          }
        }
      } else {
        const parsed = {}
        withoutHash.split('&').forEach(undecoded => {
          const parts = undecoded.split('=')
          const array = parts[1].split(',').map(value => decodeURIComponent(value))
          
          parsed[parts[0]] = array
        })

        if (parsed.code) {
          if (props.showModelSolution) {
            values = [
              ...parsed.code.slice(0,1),
              '',
              ...parsed.code.slice(1)
            ]
          } else {
            values = parsed.code
          }
        }

        if (parsed.markdown) {
          if (props.showModelSolution) {
            markdownValues = [
              ...parsed.markdown.slice(0,1),
              '',
              ...parsed.markdown.slice(1)
            ]
          } else {
            markdownValues = parsed.markdown
          }
        }
      }

      if (props.urlLogger) {
        const format = Boolean(parsedWithJSURL) ? 'jsurl' : 'basic encode'

        props.urlLogger(format, withoutHash)
      }
    }

    this.state = {
      values,
      results: [],
      runToIndex: null,
      isRunning: null,
      markdownValues,
      error: false,
      numberOfInputs
    }

    const { uniqueKey = 0 } = props

    if (!window.state) {
      window.state = {}
    }

    window.state[uniqueKey] = this.state

    if (!window.updateResults) {
      window.updateResults = {}
    }
    window.updateResults[uniqueKey] = this.updateResults.bind(this)
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

  generateUrl = (isJSURL = false) => {
    const { values, markdownValues } = this.state
    const { showModelSolution = false } = this.props

    // skip second code box if showModelSolution
    const codeValues = showModelSolution
      ? [
          ...values.slice(0,1),
          ...values.slice(2)
        ]
      : values

    const markdownCodeValues = showModelSolution
      ? [
          ...markdownValues.slice(0,1),
          ...markdownValues.slice(2)
        ]
      : markdownValues

    let encoded

    const objectToEncode = {code: codeValues, markdown: markdownCodeValues}

    if (isJSURL) {
      encoded = JSURL.stringify(objectToEncode)
      if (this.props.generateJSUrlLogger) {
        this.props.generateJSUrlLogger(encoded)
      }
    } else {
      encoded = this.serialize(objectToEncode)
      if (this.props.generateUrlLogger) {
        this.props.generateUrlLogger(encoded)
      }
    }

    if (this.props.onGenerateURL) {
      return this.props.onGenerateURL(encoded)
    }

    window.location.hash = encoded
  }

  serialize = obj =>
    Object.keys(obj).map(k => `${encodeURIComponent(k)}=${obj[k].map((value, i) => encodeURIComponent(value)).join(',')}`).join('&')

  displayNumberOfCharacters = values => values.join('').length

  onFileUpload = event => {
    const reader = new FileReader();
    reader.onload = (e) => this.onReaderLoad(e.target.result);
    reader.readAsText(event.target.files[0]);
  }

  onReaderLoad = result => {
    if (!result) {
      return false
    }
    const object = JSON.parse(result)

    if (!object) {
      return alert('Please check format of file')
    }

    if (this.props.uploadIpynbLogger) {
      this.props.uploadIpynbLogger(result)
    }

    const { cells } = object

    if (Array.isArray(cells)) {
      const { showModelSolution = false } = this.props

      let counter = 0
      const code = []
      const markdown = []

      cells.forEach((cell, i) => {
        const value = cell.source.join('')
        if (cell.cell_type === 'code') {
          if (showModelSolution && code.length === 1) {
            // add emplty value for second box
            code.push('')
          }
          code.push(value)
        } else {
          if (showModelSolution && markdown.length === 1) {
            // add emplty value for second box
            markdown.push('')
          }
          markdown.push(value)
        }
        counter += value.length
      })

      code.forEach((value, i) => this.onCodeChange(value, i))
      markdown.forEach((value, i) => this.onMarkdownChange(value, i))

      if (counter > 2000) {
        window.location.hash = ''
      }
    }
  }

  downloadFile = () => {
    const { values, markdownValues } = this.state
    const { showModelSolution = false } = this.props

    const codeValues = showModelSolution
      ? [
          ...values.slice(0,1),
          ...values.slice(2)
        ]
      : values

    const markdownCodeValues = showModelSolution
      ? [
          ...markdownValues.slice(0,1),
          ...markdownValues.slice(2)
        ]
      : markdownValues

    this.template = {...template}

    this.generateFile({type: 'code', values: codeValues})
    this.generateFile({type: 'markdown', values: markdownCodeValues})

    if (this.props.downloadIpynbLogger) {
      this.props.downloadIpynbLogger('Untitled.ipynb', this.template)
    }

    if (this.props.onDownloadFile) {
      return this.props.onDownloadFile(JSON.stringify(this.template))
    }
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(this.template));
    element.setAttribute('download', 'Untitled.ipynb');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  generateFile = obj => {
    obj.values.forEach(value => {
        const object = {
          "cell_type": obj.type,
          "metadata": {},
          "source": [
            value
          ]
        }
  
        if (obj.type === 'code') {
          object['outputs'] = []
          object['execution_count'] = null
        }
  
  
        this.template.cells.push(object)
      }
    )
  }

  updateGlobalState = () => {
    const { uniqueKey = 0 } = this.props

    window.state = {
      ...window.state,
      [uniqueKey]: this.state
    }
  }

  onCodeChange = (value, index) => {
    this.setState(state => ({
      values: [
        ...state.values.slice(0, index),
        value,
        ...state.values.slice(index + 1)
      ]
    }), this.updateGlobalState)
  }

  onIndexChange = index => {
    const { updateIndex, uniqueKey = 0 } = this.props

    this.setState({runToIndex: index, isRunning: Math.random(), error: false}, () => {
      window.uniqueKey = uniqueKey
      window.runToIndex = index
      document.getElementById('run-button').click();
    })

    if (updateIndex) {
      updateIndex(index)
    }
  }

  updateResults = (value, index, error) => {
    const hasErrors = !error

    this.setState( state => ({
        results: [
          ...state.results.slice(0, index),
          value,
          ...state.results.slice(index + 1)
        ],
        error: hasErrors || state.error
      }), 
      () => {
        if (index === this.state.runToIndex) {
          // last box was executed
          this.setState({runToIndex: null})

          if (this.props.runAllLogger) {
            this.props.runAllLogger(this.state.results, this.state.error)
          }
        }
      }
    )

    const { updateResults } = this.props

    if (updateResults) {
      updateResults(value, index)
    }
  }

  onMarkdownChange = (value, index) => {
    this.setState(state => ({
      markdownValues: [
        ...state.markdownValues.slice(0, index),
        value,
        ...state.markdownValues.slice(index + 1)
      ]
    }))
  }

  runAll = () => this.onIndexChange(this.state.numberOfInputs - 1)

  onMarkdownRun = index => {
    const { onMarkdownRun } = this.props
    if (onMarkdownRun) {
      const { markdownValues } = this.state

      onMarkdownRun(markdownValues[index], index)
    }
  }

  render() {
    const { hideButtons = false, readOnlyTests = false, onUploadFile, problem = false } = this.props
    const { values, results, isRunning, markdownValues } = this.state

    const codeLength = this.displayNumberOfCharacters(values)
    const markdownLength = this.displayNumberOfCharacters(markdownValues)
    const totalLength = codeLength + markdownLength

    const array = Array.from(Array(this.state.numberOfInputs).keys())

    return (
      <div className="container">
        {array.map(number =>
          <Editor
            isRunning={isRunning}
            readOnly={readOnlyTests || (problem && (number === array.length - 1))}
            value={values[number]}
            markdownValue={markdownValues[number]}
            result={results[number]}
            onChange={value => this.onCodeChange(value, number)}
            onMarkdownChange={value => this.onMarkdownChange(value, number)}
            onMarkdownRun={() => this.onMarkdownRun(number)}
            index={number}
            key={number}
            onRun={() => this.onIndexChange(number)}
            runAll={this.runAll}
            showButton={number === array.length - 1} />
        )}
        <p>Number of characters: {totalLength}</p>
        {!hideButtons &&
          <div>
            <button disabled={totalLength > 2000} onClick={() => this.generateUrl(false)} style={{backgroundColor: totalLength > 2000 ? 'lightgrey' : ''}}>Generate url with code</button>
            <button disabled={totalLength > 2000} onClick={() => this.generateUrl(true)} style={{backgroundColor: totalLength > 2000 ? 'lightgrey' : ''}}>Generate url with JSURL</button>
            <button onClick={this.downloadFile}>Download .ipynb</button>
            <button onClick={onUploadFile ? onUploadFile : () => {}}>
              <label htmlFor="file-upload" style={{display: 'inherit', marginBottom: '0', fontWeight: '400'}}>
                Upload file
              </label>
            </button>
            {!onUploadFile &&  <input id="file-upload" type="file" onChange={this.onFileUpload} style={{display: 'none'}} />}
          </div>
        }
      </div>
    )
  }
}

export default CodeApp
