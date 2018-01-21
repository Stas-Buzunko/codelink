// save left

import React, { Component } from 'react'
import Button from 'material-ui/Button';
import Input, { InputLabel } from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import _ from 'lodash'
import * as firebase from 'firebase'
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Select from 'material-ui/Select';
import moment from 'moment'

import DayPickerInput from 'react-day-picker/DayPickerInput'
import 'react-day-picker/lib/style.css'
import Switch from 'material-ui/Switch';

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

class NewAssignment extends Component {
  state = {
    title: 'Change Assignment Name',
    isTextQuestion: false,
    selectedProblem: '',
    selectedDay: moment().add(7, 'days').toDate(),
    question: '',
    answer: ''
  }

  componentDidMount() {
    const { uid } = this.props
    firebase.database().ref('problems').orderByChild('owner').equalTo(uid).once('value')
    .then(snapshot => snapshot.val() && this.setState({problems: snapshot.val()}))

    firebase.database().ref('paths').orderByChild('owner').equalTo(uid).once('value')
    .then(snapshot => snapshot.val() && this.setState({paths: snapshot.val()}))
  }

  renderSelect = () => {
    const { paths, problems, selectedProblem } = this.state
    const { classes } = this.props

    if (!paths || !problems) {
      return 'Loading...'
    }

    const problemsNotOnPath = _.map(problems, (problem, problemKey) => ({...problem, key: problemKey}))
      .filter(problem =>
        !_.some(paths, (path, pathKey) => path.pathProblems && path.pathProblems[problem.key] !== undefined)
      )

    return (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="problem-select">Problem</InputLabel>
        <Select
          native
          value={selectedProblem}
          onChange={e => this.setState({selectedProblem: e.target.value})}
          input={<Input id="problem-select" />}
        >
          <option value="" />
          {_.map(paths, (path, pathKey) =>
            <optgroup label={path.title} key={pathKey}>
              {path.pathProblems && _.map(path.pathProblems, (problem, problemKey) => {
                if (!problems[problemKey]) {
                  return false
                }

                return <option value={problemKey} key={problemKey}>{problems[problemKey].name}</option>
              })}
            </optgroup>
          )}
          
          {problemsNotOnPath.length &&
            <optgroup label="Without path">
              {problemsNotOnPath.map((problem, i) => 
                <option value={problem.key} key={i}>{problem.name}</option>
              )}
            </optgroup>
          }
        </Select>
      </FormControl>
    )
  }

  saveAssignment = () => {
    const { selectedProblem, title, selectedDay, question, answer, isTextQuestion } = this.state
    const { onSubmit } = this.props

    if (title && selectedDay && (!isTextQuestion && selectedProblem || isTextQuestion && question && answer)) {
      const assignment = {
        title,
        deadline: selectedDay.getTime(),
        isTextQuestion
      }

      if (isTextQuestion) {
        assignment.answer = answer
        assignment.question = question
      } else {
        assignment.problem = selectedProblem
      }

      onSubmit(assignment)
    } else {
      alert('Please, fill all fields')
    }
  }

  render() {
    const { title, selectedProblem, selectedDay, isTextQuestion, question, answer } = this.state
    const { classes } = this.props

    return (
      <div>
        <FormControl className={classes.formControl}>
          <TextField
            id="title"
            label="Assignment title"
            className={classes.textField}
            value={title}
            onChange={e => this.setState({title: e.target.value})}
            margin="normal"
          />
        </FormControl>
        <br />
        <FormControl className={classes.formControl}>
          <InputLabel>Deadline</InputLabel>
          <br/>
          <br/>
          <DayPickerInput
            onDayChange={day => this.setState({selectedDay: day})}
            component={TextField}
            value={selectedDay}
            label="Deadline"
            dayPickerProps={{
              month: selectedDay,
              selectedDays: [selectedDay],
              disabledDays: { before: new Date() },
            }}
          />
        </FormControl>
        <br />

        <FormControl className={classes.formControl}>
          <FormControlLabel
            control={
              <Switch
                checked={isTextQuestion}
                onChange={() => this.setState({isTextQuestion: !isTextQuestion})}
                aria-label="checkedA"
              />
            }
            label={isTextQuestion ? 'Type - Text question' : 'Type - Problem'}
          />
        </FormControl>
        {isTextQuestion
          ? <FormControl className={classes.formControl}>
              <TextField
                id="question"
                label="Question"
                className={classes.textField}
                value={question}
                onChange={e => this.setState({question: e.target.value})}
                margin="normal"
              />
              <TextField
                id="answer"
                label="Answer"
                className={classes.textField}
                value={answer}
                onChange={e => this.setState({answer: e.target.value})}
                margin="normal"
              />
            </FormControl>
          : this.renderSelect()
        }
        <Button raised onClick={this.saveAssignment}>
          Save
        </Button>
      </div>
    )
  }
}

export default withStyles(styles)(NewAssignment);
