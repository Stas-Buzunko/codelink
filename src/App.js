import React, { Component } from 'react';
import { connect } from 'react-redux'
import JSURL from 'jsurl'
import { updateCode, updateIndex } from './actions/'
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
      cells.forEach((cell, i) => this.props.updateCode(cell.source.join(''), i))
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
            onChange={value => this.props.updateCode(value, number)}
            index={number}
            key={number}
            onRun={() => this.props.updateIndex(number)}
            onStop={() => this.setState({ isRunning: false })}
            runAll={() => this.props.updateIndex(numberOfInputs - 1)} />
        )}
        <p>Number of characters: {this.displayNumberOfCharacters()}</p>
        <button onClick={() => this.generateUrl(false)}>Generate url with code</button>
        <button onClick={() => this.generateUrl(true)}>Generate url with JSURL</button>
        <button onClick={this.downloadFile}>Download .ipynb</button>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  userCode: state.userCode
})

export default connect(mapStateToProps , { updateCode, updateIndex })(CodeApp)
