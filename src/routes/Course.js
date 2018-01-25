import React, { Component } from 'react'
import Button from 'material-ui/Button';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
// import Input, { InputLabel } from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import _ from 'lodash'
import * as firebase from 'firebase'
import Tabs, { Tab } from 'material-ui/Tabs';
import AssignmentsTable from '../components/AssignmentsTable'
import NewAssignment from '../components/NewAssignment'

class Course extends Component {
  state = {
    course: null,
    password: '',
    tab: 0,
    assignments: {},
    students: []
  }

  componentDidMount() {
    const { params } = this.props.match

    if (!params || !params.id) {
      // no id
      return this.props.history.push('/courses')
    }

    firebase.database().ref('courses/' + params.id).once('value')
    .then(snapshot => {
      const course = snapshot.val()

      if (course) {
        if (course.courseMembers) {
          const promises = Object.keys(course.courseMembers).map(studentKey =>
            firebase.database().ref('users/' + studentKey).once('value')
            .then(snapshot => snapshot.val() && {
              [snapshot.key]: snapshot.val().name
            })
          )

          Promise.all(promises).then(result => this.setState({
            students: result.filter(user => user),
            course: {...course, key: snapshot.key}
          }))
        } else {
          this.setState({course: {...course, key: snapshot.key}})
        }
      } else {
        // course doesn't exist
        return this.props.history.push('/courses')
      }
    })

    firebase.database().ref('assignments/' + params.id)
    .on('value', snapshot => snapshot.val() && this.setState({assignments: snapshot.val()}))
  }

  enrollUser = () => {
    const { user } = this.props
    const { password, course } = this.state

    if (!password) {
      return alert('Fill password')
    }

    const updates = {}

    updates['studentCoursePasswords/' + course.key + '/' + user.uid] = password
    updates['courses/' + course.key + '/courseMembers/' + user.uid] = true
    updates['users/' + user.uid + '/courses/' + course.key] = true

    firebase.database().ref().update(updates)
    .then(() => firebase.database().ref('logged_events').push(`User ${user.uid} enrolled for course ${course.key}`))
    .catch(e => e.code === 'PERMISSION_DENIED' && alert('Wrong password'))
  }

  editAssignment = () => {
    // 
  }

  renderContent = () => {
    const { uid } = this.props.user 
    const { tab, course, assignments, students } = this.state
    let view

    switch (tab) {
      case 0:
        view = <AssignmentsTable editAssignment={this.editAssignment} students={students} instructorView assignments={assignments} />
        break;
      case 1:
        view = <NewAssignment onSubmit={this.saveAssignment} uid={uid} courseId={course.key} />
        break;
      default:
        view = <AssignmentsTable students={students} assignments={assignments} />
    }

    return view
  }

  saveAssignment = assignment => {
    const { key } = this.state.course
    const assignmentKey = firebase.database().ref('assignments/' + key).push().key

    firebase.database().ref('assignments/' + key + '/' + assignmentKey).set(assignment)
    .then(() => {
      this.setState({tab: 0})
      firebase.database().ref('logged_events').push(`Assignment ${assignmentKey} for course ${key}`)
    })
  }

  render() {
    const { course, password, tab } = this.state
    const { classes, user, match, assignments, students } = this.props

    if (!course) {
      return (
        <div>Loading...</div>
      )
    }

    const isOwner = user.uid === course.owner
    const isEnrolled = user.courses && user.courses[match.params.id]

    return (
      <div>
        <h4>{course.name}</h4>
        {isOwner
          ? <div>
              <Tabs
                value={tab}
                onChange={(e, i) => this.setState({tab: i})}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Assignments" />
                <Tab label="Add Assignments" />
                <Tab label="Student view" />
              </Tabs>
              {this.renderContent()}
            </div>
          : !isEnrolled
            ? <form className={classes.container}>
                <TextField
                  id="password"
                  label="Course password"
                  className={classes.textField}
                  value={password}
                  onChange={e => this.setState({password: e.target.value})}
                  margin="normal"
                />
                <Button raised onClick={this.enrollUser}>
                  Enter password
                </Button>
              </form>
            : <AssignmentsTable students={students} assignments={assignments} />
        }
      </div>
    )
  }
}

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
});

export default withStyles(styles)(Course);
