import React, { Component } from 'react'
import Button from 'material-ui/Button';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Input, { InputLabel } from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import _ from 'lodash'
import * as firebase from 'firebase'

class Course extends Component {
  state = {
    course: null,
    password: ''
  }

  componentDidMount() {
    const { params } = this.props.match

    if (!params || !params.id) {
      // no id
      return this.props.history.push('/courses')
    }

    firebase.database().ref('courses/'+ params.id).once('value')
    .then(snapshot => {
      const course = snapshot.val()

      if (course) {
        this.setState({course: {...course, key: snapshot.key}})
      } else {
        // course doesn't exist
        return this.props.history.push('/courses')
      }
    })
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
    .catch(e => e.code === 'PERMISSION_DENIED' && alert('Wrong password'))
  }

  render() {
    const { course, password } = this.state
    const { classes, user, match } = this.props

    if (!course) {
      return (
        <div>Loading...</div>
      )
    }

    const isEnrolled = user.courses && user.courses[match.params.id]

    return (
      <div>
        <h4>{course.name}</h4>
        {!isEnrolled
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
          : <div>My Assignments</div>
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
