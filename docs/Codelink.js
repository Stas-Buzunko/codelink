const AceEditor = ReactAce.default

const Editor = ({ onRun, index, onChange, value = '', result, runAll, readOnly, showButton = true }) => (
  <div className="col-lg-12" style={{marginTop: '20px'}}>
    <div className="col-lg-6">
      <div className="row">
        <div className="editor" style={{width: '100%'}}>
          <AceEditor
            readOnly={readOnly}
            mode="python"
            theme=""
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
        {showButton &&
          <div className="col-lg-4">
            <button
              className="btn btn-success"
              onClick={onRun}
            >
              Run All Above
            </button>
          </div>
        }
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

class CodeApp extends React.Component {
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

  generateUrl = (isJSURL = false) => {
    const { values } = this.state
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

    if (this.props.onGenerateURL) {
      return this.props.onGenerateURL(encoded)
    }

    window.location.hash = encoded
  }

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
    const { cells } = object

    if (Array.isArray(cells)) {
      let counter = 0
      cells.forEach((cell, i) => {
        const value = cell.source.join('')
        this.onCodeChange(value, i)
        counter += value.length
      })

      if (counter > 2000) {
        window.location.hash = ''
      }
    }
  }

  downloadFile = () => {
    const { values } = this.state
    const file = this.generateFile(values)
    if (this.props.onDownloadFile) {
      return this.props.onDownloadFile(JSON.stringify(file))
    }
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
    const { updateCode } = this.props

    this.setState(state => ({
      values: [
        ...state.values.slice(0, index),
        value,
        ...state.values.slice(index + 1)
      ]
    }), () => {window.state = this.state})

    if (updateCode) {
      updateCode(value, index)
    }
  }

  onIndexChange = index => {
    const { updateIndex } = this.props

    this.setState({runFromIndex: index}, () => {
      window.state = this.state
      document.getElementById('run-button').click();
    })

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
    const { hideButtons = false, readOnlyTests = false, onUploadFile } = this.props
    const { values, results, exportedText } = this.state

    const codeLength = this.displayNumberOfCharacters(values)
    const array = Array.from(Array(numberOfInputs).keys())

    return (
      <div className="container">
        {array.map(number =>
          <Editor
            readOnly={readOnlyTests}
            value={values[number]}
            result={results[number]}
            onChange={value => this.onCodeChange(value, number)}
            index={number}
            key={number}
            onRun={() => this.onIndexChange(number)}
            runAll={() => this.onIndexChange(numberOfInputs - 1)}
            showButton={!readOnlyTests || (number === array.length -1) } />
        )}
        <p>Number of characters: {codeLength}</p>
        {!hideButtons &&
          <div>
            <button disabled={codeLength > 2000} onClick={() => this.generateUrl(false)} style={{backgroundColor: codeLength > 2000 ? 'lightgrey' : ''}}>Generate url with code</button>
            <button disabled={codeLength > 2000} onClick={() => this.generateUrl(true)} style={{backgroundColor: codeLength > 2000 ? 'lightgrey' : ''}}>Generate url with JSURL</button>
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

