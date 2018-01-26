import React, { Component } from 'react'
import Button from 'material-ui/Button';
// import Input, { InputLabel } from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import * as firebase from 'firebase'
import Tabs, { Tab } from 'material-ui/Tabs';
import AssignmentsTable from '../components/AssignmentsTable'
import NewAssignment from '../components/NewAssignment'
import SolveAssginment from '../components/SolveAssginment'

class Course extends Component {
  state = {
    course: null,
    password: '',
    tab: 0,
    assignments: {},
    students: [],
    assignmentToEdit: {},
    editingKey: '',
    isSolvingProblem: false
  }

  componentDidMount() {
    const { user, match, history } = this.props
    const { params } = match

    if (!params || !params.id) {
      // no id
      return history.push('/courses')
    }

    firebase.database().ref('courses/' + params.id).once('value')
    .then(snapshot => {
      const course = snapshot.val()

      if (course) {
        const isOwner = course.owner === user.uid
        let ref
        if (isOwner) {
          // if owner = download all solutions and display in instructor view
          ref = firebase.database().ref('solutions/' + params.id)
        } else {
          // if not owner, download user solution
          ref = firebase.database().ref('solutions/' + params.id + '/' + user.uid)
        }

        ref.on('value', solutionsSnap => {
          const solutions = solutionsSnap.val()

          if (solutions) {
            this.setState({solutions})
          }
        })

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

  editAssignment = assignmentKey => {
    const { assignments } = this.state

    this.setState({assignmentToEdit: assignments[assignmentKey], editingKey: assignmentKey, tab: 1})
  }

  renderContent = () => {
    const { uid } = this.props.user 
    const { tab, course, assignments, students, assignmentToEdit, solutions } = this.state
    let view

    switch (tab) {
      case 0:
        view = <AssignmentsTable solutions={solutions} editAssignment={this.editAssignment} students={students} instructorView assignments={assignments} />
        break;
      case 1:
        view = <NewAssignment onSubmit={this.saveAssignment} uid={uid} courseId={course.key} assignmentToEdit={assignmentToEdit} />
        break;
      default:
        view = <AssignmentsTable students={students} assignments={assignments} />
    }

    return view
  }

  saveAssignment = assignment => {
    const { editingKey, course } = this.state
    const { key } = course
    let assignmentKey

    if (editingKey) {
      assignmentKey = editingKey
    } else {
      assignmentKey = firebase.database().ref('assignments/' + key).push().key
    }

    firebase.database().ref('assignments/' + key + '/' + assignmentKey).set(assignment)
    .then(() => {
      this.setState({tab: 0, editingKey: '', assignmentToEdit: {}})
      firebase.database().ref('logged_events').push(`Assignment ${assignmentKey} for course ${key}`)
    })
  }

  render() {
    const { course, password, tab, isSolvingProblem, students, assignments, assignmentKey, solutions } = this.state
    const { classes, user, match } = this.props

    if (!course) {
      return (
        <div>Loading...</div>
      )
    }

    const isOwner = user.uid === course.owner
    const isEnrolled = user.courses && user.courses[match.params.id]

    return (
      <div>
        <h4>{course.name} {isSolvingProblem &&
          <span>
            {assignments[assignmentKey].title}

            <Button onClick={() => this.setState({isSolvingProblem: false, assignmentKey: ''})}>
              Back
            </Button>
          </span>
        }</h4>
        {isOwner
          ? <div>
              <Tabs
                value={tab}
                onChange={(e, i) => this.setState({tab: i, assignmentToEdit: {}, editingKey: ''})}
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
            : isSolvingProblem
              ? <SolveAssginment
                  assignment={assignments[assignmentKey]}
                  courseKey={course.key}
                  studentKey={user.uid}
                  assignmentKey={assignmentKey}
                  onSolve={() => this.setState({isSolvingProblem: false, assignmentKey: ''})} />
              : <AssignmentsTable
                  solutions={solutions}
                  students={students}
                  assignments={assignments}
                  onSubmit={(key) => this.setState({isSolvingProblem: true, assignmentKey: key})} />
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
