import React, { Component } from 'react'
import Codelink from '../components/Codelink'
import * as firebase from 'firebase'

class EditProblem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: '',
      markdownValues: ['','',''],
      values: ['','','']
    }
  }

  componentWillMount() {
    const { history, match } = this.props

    if (!match.params.id) {
      return history.push('/paths')
    }

    firebase.database().ref('problems/' + match.params.id).once('value')
    .then(snapshot => {
      const problem = snapshot.val()

      if (problem) {
        this.setState({
          name: problem.name,
          markdownValues: [
            problem.markdown[0] || '',
            problem.markdownSolution || '',
            problem.markdown[1] || '',
          ],
          values: [
            problem.code[0] || '',
            problem.codeSolution || '',
            problem.code[1] || '',
          ]
        })
      } else {
        // doesn't exist or don't have access
        alert('No such problem or you are not the owner')
        return history.push('/paths')
      }
    })
  }

  saveProblem = () => {
    const state = window.state.solution
    const { history, match } = this.props
    const { name } = this.state
    const { id } = match.params

    if (!name) {
      return alert('Please name your problem')
    }

    firebase.database().ref('problems/' + id).update({
      markdown: [state.markdownValues[0],state.markdownValues[2]],
      markdownSolution: state.markdownValues[1],
      code: [state.values[0],state.values[2]],
      codeSolution: state.values[1],
      name,
      lastEdited: firebase.database.ServerValue.TIMESTAMP
      // ipynb
    })
    .then(() => history.push('/paths'))
  }

  render() {
    const { name, markdownValues, values } = this.state

    return (
      <div>
        <Codelink showModelSolution={true} uniqueKey='solution' markdownValues={markdownValues} values={values} />
        <input value={name} onChange={e => this.setState({name: e.target.value})} placeholdet="Your problem's name" />
        <button onClick={this.saveProblem}>Save</button>
      </div>
    )
  }
} 

export default EditProblem
