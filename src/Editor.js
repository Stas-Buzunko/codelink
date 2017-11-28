import React from 'react';
import AceEditor from 'react-ace'

const Editor = ({ onRun, index, onChange, value = '', result, runAll, readOnly }) => (
  <div className="col-lg-12" style={{marginTop: '20px'}}>
    <div className="col-lg-6">
      <div className="row">
        <div className="editor" style={{width: '100%'}}>
          <AceEditor
            readOnly={readOnly}
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

export default Editor