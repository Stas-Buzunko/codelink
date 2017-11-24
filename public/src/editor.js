ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/');
const editorOptions = [
    'minLines',
    'maxLines',
    'readOnly',
    'highlightActiveLine',
    'tabSize',
    'enableBasicAutocompletion',
    'enableLiveAutocompletion',
    'enableSnippets',
  ]
  
  const editorEvents = [
    'onChange',
    'onFocus',
    'onBlur',
    'onCopy',
    'onPaste',
    'onSelectionChange',
    'onScroll',
    'handleOptions',
    'updateRef',
  ]
  
const PropTypes  = React.PropTypes; 
const isEqual =_.isEqual ;
const { Range:Ranger } = window.ace.acequire('ace/range');
class AceEditor extends React.Component {
  constructor(props) {
    super(props);
    editorEvents.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    const {
      className,
      onBeforeLoad,
      onValidate,
      mode,
      focus,
      theme,
      fontSize,
      value,
      defaultValue,
      cursorStart,
      showGutter,
      wrapEnabled,
      showPrintMargin,
      scrollMargin = [ 0, 0, 0, 0],
      keyboardHandler,
      onLoad,
      commands,
      annotations,
      markers,
    } = this.props;

    this.editor = ace.edit(this.refEditor);

    if (onBeforeLoad) {
      onBeforeLoad(ace);
    }

    const editorProps = Object.keys(this.props.editorProps);
    for (let i = 0; i < editorProps.length; i++) {
      this.editor[editorProps[i]] = this.props.editorProps[editorProps[i]];
    }

    this.editor.renderer.setScrollMargin(scrollMargin[0], scrollMargin[1], scrollMargin[2], scrollMargin[3])
    this.editor.getSession().setMode(`ace/mode/${mode}`);
    this.editor.setTheme(`ace/theme/${theme}`);
    this.editor.setFontSize(fontSize);
    this.editor.setValue(defaultValue === undefined ? value : defaultValue, cursorStart);
    this.editor.renderer.setShowGutter(showGutter);
    this.editor.getSession().setUseWrapMode(wrapEnabled);
    this.editor.setShowPrintMargin(showPrintMargin);
    this.editor.on('focus', this.onFocus);
    this.editor.on('blur', this.onBlur);
    this.editor.on('copy', this.onCopy);
    this.editor.on('paste', this.onPaste);
    this.editor.on('change', this.onChange);
    this.editor.getSession().selection.on('changeSelection', this.onSelectionChange);
    if (onValidate) {
      this.editor.getSession().on('changeAnnotation', () => {
        const annotations = this.editor.getSession().getAnnotations();
        this.props.onValidate(annotations);
      });
    }
    this.editor.session.on('changeScrollTop', this.onScroll);
    this.editor.getSession().setAnnotations(annotations || []);
    if(markers && markers.length > 0){
      this.handleMarkers(markers);
    }

    // get a list of possible options to avoid 'misspelled option errors'
    const availableOptions = this.editor.$options;
    for (let i = 0; i < editorOptions.length; i++) {
      const option = editorOptions[i];
      if (availableOptions.hasOwnProperty(option)) {
        this.editor.setOption(option, this.props[option]);
      } else if (this.props[option]) {
        console.warn(`ReaceAce: editor option ${option} was activated but not found. Did you need to import a related tool or did you possibly mispell the option?`)
      }
    }
    this.handleOptions(this.props);

    if (Array.isArray(commands)) {
      commands.forEach((command) => {
        if(typeof command.exec == 'string') {
          this.editor.commands.bindKey(command.bindKey, command.exec);
        }
        else {
          this.editor.commands.addCommand(command);
        }
      });
    }

    if (keyboardHandler) {
      this.editor.setKeyboardHandler('ace/keyboard/' + keyboardHandler);
    }

    if (className) {
      this.refEditor.className += ' ' + className;
    }

    if (focus) {
      this.editor.focus();
    }

    if (onLoad) {
      onLoad(this.editor);
    }

    this.editor.resize();
  }

  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;

    for (let i = 0; i < editorOptions.length; i++) {
      const option = editorOptions[i];
      if (nextProps[option] !== oldProps[option]) {
        this.editor.setOption(option, nextProps[option]);
      }
    }

    if (nextProps.className !== oldProps.className) {
      let appliedClasses = this.refEditor.className;
      let appliedClassesArray = appliedClasses.trim().split(' ');
      let oldClassesArray = oldProps.className.trim().split(' ');
      oldClassesArray.forEach((oldClass) => {
        let index = appliedClassesArray.indexOf(oldClass);
        appliedClassesArray.splice(index, 1);
      });
      this.refEditor.className = ' ' + nextProps.className + ' ' + appliedClassesArray.join(' ');
    }

    if (nextProps.mode !== oldProps.mode) {
      this.editor.getSession().setMode('ace/mode/' + nextProps.mode);
    }
    if (nextProps.theme !== oldProps.theme) {
      this.editor.setTheme('ace/theme/' + nextProps.theme);
    }
    if (nextProps.keyboardHandler !== oldProps.keyboardHandler) {
      if (nextProps.keyboardHandler) {
        this.editor.setKeyboardHandler('ace/keyboard/' + nextProps.keyboardHandler);
      } else {
        this.editor.setKeyboardHandler(null);
      }
    }
    if (nextProps.fontSize !== oldProps.fontSize) {
      this.editor.setFontSize(nextProps.fontSize);
    }
    if (nextProps.wrapEnabled !== oldProps.wrapEnabled) {
      this.editor.getSession().setUseWrapMode(nextProps.wrapEnabled);
    }
    if (nextProps.showPrintMargin !== oldProps.showPrintMargin) {
      this.editor.setShowPrintMargin(nextProps.showPrintMargin);
    }
    if (nextProps.showGutter !== oldProps.showGutter) {
      this.editor.renderer.setShowGutter(nextProps.showGutter);
    }
    if (!isEqual(nextProps.setOptions, oldProps.setOptions)) {
      this.handleOptions(nextProps);
    }
    if (!isEqual(nextProps.annotations, oldProps.annotations)) {
      this.editor.getSession().setAnnotations(nextProps.annotations || []);
    }
    if (!isEqual(nextProps.markers, oldProps.markers) && (Array.isArray(nextProps.markers))) {
      this.handleMarkers(nextProps.markers);
    }

    // this doesn't look like it works at all....
    if (!isEqual(nextProps.scrollMargin, oldProps.scrollMargin)) {
      this.handleScrollMargins(nextProps.scrollMargin)
    }
    if (this.editor && this.editor.getValue() !== nextProps.value) {
      // editor.setValue is a synchronous function call, change event is emitted before setValue return.
      this.silent = true;
      const pos = this.editor.session.selection.toJSON();
      this.editor.setValue(nextProps.value, nextProps.cursorStart);
      this.editor.session.selection.fromJSON(pos);
      this.silent = false;
    }

    if (nextProps.focus && !oldProps.focus) {
      this.editor.focus();
    }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.height !== this.props.height || prevProps.width !== this.props.width){
      this.editor.resize();
    }
  }

  handleScrollMargins(margins = [0, 0, 0, 0]) {
    this.editor.renderer.setScrollMargins(margins[0], margins[1], margins[2], margins[3])
  }

  componentWillUnmount() {
    this.editor.destroy();
    this.editor = null;
  }

  onChange(event) {
    if (this.props.onChange && !this.silent) {
      const value = this.editor.getValue();
      this.props.onChange(value, event);
    }
  }

  onSelectionChange(event) {
    if (this.props.onSelectionChange) {
      const value = this.editor.getSelection();
      this.props.onSelectionChange(value, event);
    }
  }

  onFocus(event) {
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  }

  onBlur(event) {
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  }

  onCopy(text) {
    if (this.props.onCopy) {
      this.props.onCopy(text);
    }
  }

  onPaste(text) {
    if (this.props.onPaste) {
      this.props.onPaste(text);
    }
  }

  onScroll() {
    if (this.props.onScroll) {
      this.props.onScroll(this.editor);
    }
  }
  

  handleOptions(props) {
    const setOptions = Object.keys(props.setOptions);
    for (let y = 0; y < setOptions.length; y++) {
      this.editor.setOption(setOptions[y], props.setOptions[setOptions[y]]);
    }
  }

  handleMarkers(markers) {
    // remove foreground markers
    let currentMarkers = this.editor.getSession().getMarkers(true);
    for (const i in currentMarkers) {
      if (currentMarkers.hasOwnProperty(i)) {
        this.editor.getSession().removeMarker(currentMarkers[i].id);
      }
    }
    // remove background markers
    currentMarkers = this.editor.getSession().getMarkers(false);
    for (const i in currentMarkers) {
      if (currentMarkers.hasOwnProperty(i)) {
        this.editor.getSession().removeMarker(currentMarkers[i].id);
      }
    }
    // add new markers
    markers.forEach(({ startRow, startCol, endRow, endCol, className, type, inFront = false }) => {
      const range = new Ranger(startRow, startCol, endRow, endCol);
      this.editor.getSession().addMarker(range, className, type, inFront);
    });
  }

  updateRef(item) {
    this.refEditor = item;
  }

  render() {
    const { name, width, height, style } = this.props;
    const divStyle = { width, height, ...style };
    return (
      <div ref={this.updateRef} id={name} style={divStyle}>
      </div>
    );
  }
}

AceEditor.propTypes = {
  mode: PropTypes.string,
  focus: PropTypes.bool,
  theme: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  fontSize: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  showGutter: PropTypes.bool,
  onChange: PropTypes.func,
  onCopy: PropTypes.func,
  onPaste: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onScroll: PropTypes.func,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onLoad: PropTypes.func,
  onSelectionChange: PropTypes.func,
  onBeforeLoad: PropTypes.func,
  onValidate: PropTypes.func,
  minLines: PropTypes.number,
  maxLines: PropTypes.number,
  readOnly: PropTypes.bool,
  highlightActiveLine: PropTypes.bool,
  tabSize: PropTypes.number,
  showPrintMargin: PropTypes.bool,
  cursorStart: PropTypes.number,
  editorProps: PropTypes.object,
  setOptions: PropTypes.object,
  style: PropTypes.object,
  scrollMargin: PropTypes.array,
  annotations: PropTypes.array,
  markers: PropTypes.array,
  keyboardHandler: PropTypes.string,
  wrapEnabled: PropTypes.bool,
  enableBasicAutocompletion: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array,
  ]),
  enableLiveAutocompletion: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array,
  ]),
  commands: PropTypes.array,
};

AceEditor.defaultProps = {
  name: 'brace-editor',
  focus: false,
  mode: '',
  theme: '',
  height: '500px',
  width: '500px',
  value: '',
  fontSize: 12,
  showGutter: true,
  onChange: null,
  onPaste: null,
  onLoad: null,
  onScroll: null,
  minLines: null,
  maxLines: null,
  readOnly: false,
  highlightActiveLine: true,
  showPrintMargin: true,
  tabSize: 4,
  cursorStart: 1,
  editorProps: {},
  style: {},
  scrollMargin: [ 0, 0, 0, 0],
  setOptions: {},
  wrapEnabled: false,
  enableBasicAutocompletion: false,
  enableLiveAutocompletion: false,
};

const ReactAce2 = ReactAce.default;

class Editor extends React.Component{
 render(){
   const { onRun, index, onChange, value = '', result, runAll } = this.props;

   return (
        <div className="col-lg-12" style={{marginTop: '20px'}}>
            <div className="col-lg-6">
                <div className="row">
                    <div className="editor" style={{width: '100%'}}>
                        <AceEditor
                          mode="python"
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
   )}
}

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
