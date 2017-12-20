import React from 'react'
import { connect } from 'react-redux'
import { updateIndex, updateResults, updateMarkdown } from '../actions'
import Codelink from '../components/Codelink'

const Home = () =>
  <Codelink
    updateResults={(value, index) => this.props.updateResults(value, index)}
    updateIndex={index => this.props.updateIndex(index)}
    onMarkdownRun={(value, index) => this.props.updateMarkdown(value, index)}
    hideButtons={false}
    readOnlyTests={false} />

export default connect(null, { updateIndex, updateResults, updateMarkdown })(Home)
