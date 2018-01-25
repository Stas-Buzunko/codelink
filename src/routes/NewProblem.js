import React, { Component } from 'react'
import Codelink from '../components/Codelink'
import * as firebase from 'firebase'

class NewProblem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: ''
    }
  }

  saveProblem = () => {
    const state = window.state.solution
    const { user, history } = this.props
    const { name } = this.state

    if (!name) {
      return alert('Please name your problem')
    }

    const problemKey = firebase.database().ref('problems').push().key

    firebase.database().ref('problems/' + problemKey).set({
      owner: user.uid,
      markdown: [state.markdownValues[0],state.markdownValues[2]],
      markdownSolution: state.markdownValues[1],
      code: [state.values[0],state.values[2]],
      codeSolution: state.values[1],
      name,
      dateCreated: firebase.database.ServerValue.TIMESTAMP,
      lastEdited: firebase.database.ServerValue.TIMESTAMP
      // ipynb
    })
    .then(() => {
      firebase.database().ref('logged_events').push(`Problem ${problemKey} has been created by ${user.uid}`)
      return history.push('/paths')
    })
  }

  render() {
    const { name } = this.state

    return (
      <div>
        <Codelink showModelSolution={true} uniqueKey='solution' />
        <input value={name} onChange={e => this.setState({name: e.target.value})} placeholdet="Your problem's name" />
        <button onClick={this.saveProblem}>Save</button>
      </div>
    )
  }
} 

export default NewProblem
