import React, { Component } from 'react';
import Markdown from 'react-markdown'
import AceEditor from 'react-ace'

class MarkdownEditor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isEditing: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isRunning !== nextProps.isRunning && nextProps.isRunning) {
      this.setState({isEditing: false})
    }
  }

  onClick = () => {
    if (!this.click1) {
      this.click1 = Date.now()
      this.click2 = null

      setTimeout(() => {
        this.click1 = null
        this.click2 = null
      }, 200)
    } else {
      this.click2 = Date.now()

      if (this.click1 - this.click2 < 200) {
        // double click
        this.setState({isEditing: true})
      }
    }
  }

  handleKeyPress = e => {
    if (e.key === 'Enter' && this.click1) {
      this.setState({isEditing: true})
    }
  }

  render() {
    const { isEditing } = this.state
    const { value, onMarkdownChange } = this.props

    return (
      <div>
        {isEditing
          ? <AceEditor
              mode="markdown"
              theme=""
              value={value}
              onChange={value => onMarkdownChange(value)}
              editorProps={{$blockScrolling: true}}
              minLines={1}
              maxLines={value ? value.split(/\r\n|\r|\n/).length : 1}
              showLineNumbers={false}
              commands={[{   // commands is array of key bindings.
                name: 'executeCode', //name for the key binding.
                bindKey: { win: 'Shift-Enter', mac: 'Shift-Enter' }, //key combination used for the command.
                exec: () => this.setState({isEditing: false})  //function to execute when keys are pressed.
              }]}
            />
          : <div
              onClick={this.onClick}
              onKeyDown={this.handleKeyPress}
              tabIndex="0"
              style={{userSelect: 'none', minHeight: '50px', backgroundColor: '#f5f5f5', border: '1px solid #ccc'}}>
              <Markdown escapeHtml={false} source={value} />
            </div>
        }
      </div>
    )
  }
}

export default MarkdownEditor
