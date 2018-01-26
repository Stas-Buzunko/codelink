import React, { Component } from 'react'
import Codelink from './Codelink'
import * as firebase from 'firebase'
import TextField from 'material-ui/TextField';
import { FormControl } from 'material-ui/Form';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  menu: {
    width: 200,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 300,
  },
});

class SolveAssginment extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: '',
      markdownValues: ['','',''],
      values: ['','',''],
      answer: ''
    }
  }

  componentWillMount() {
    const { assignment } = this.props

    // then we need to fetch a problem
    if (!assignment.isTextQuestion && assignment.problem) {
      firebase.database().ref('problems/' + assignment.problem).once('value')
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
        }
      })
    }
  }

  saveProblem = () => {
    // const state = window.state.solution
    // const { history, match } = this.props
    // const { name } = this.state
    // const { id } = match.params

    // if (!name) {
    //   return alert('Please name your problem')
    // }

    // firebase.database().ref('problems/' + id).update({
    //   markdown: [state.markdownValues[0],state.markdownValues[2]],
    //   markdownSolution: state.markdownValues[1],
    //   code: [state.values[0],state.values[2]],
    //   codeSolution: state.values[1],
    //   name,
    //   lastEdited: firebase.database.ServerValue.TIMESTAMP
    //   // ipynb
    // })
    // .then(() => history.push('/paths'))
  }

  checkAnswer = () => {
    const { assignment, courseKey, studentKey, assignmentKey, onSolve } = this.props
    const { answer } = this.state

    if (assignment.answer.toLowerCase() !== answer.toLowerCase()) {
      return alert('Wrong answer, try again.')
    }

    firebase.database().ref('solutions/' + courseKey + '/' + studentKey + '/' + assignmentKey).set(answer)
    .then(onSolve)
  }

  checkProblem = () => {
    const { courseKey, studentKey, assignmentKey, onSolve } = this.props

    firebase.database().ref('solutions/' + courseKey + '/' + studentKey + '/' + assignmentKey).set(true)
    .then(onSolve)
  }

  render() {
    const { markdownValues, values, answer } = this.state
    const { assignment, classes } = this.props

    if (assignment.isTextQuestion) {
      return (
        <div>
          Question: {assignment.question}

          <FormControl className={classes.formControl}>
          <TextField
            id="title"
            label="Your answer"
            className={classes.textField}
            value={answer}
            onChange={e => this.setState({answer: e.target.value})}
            margin="normal"
          />
        </FormControl>
          <Button raised onClick={this.checkAnswer}>
            Submit
          </Button>
        </div>
      )
    }

    return (
      <div>
        <Codelink showModelSolution={true} uniqueKey='solution' markdownValues={markdownValues} values={values} />
        <Button raised onClick={this.checkProblem}>
          Submit
        </Button>
      </div>
    )
  }
} 

export default withStyles(styles)(SolveAssginment)
