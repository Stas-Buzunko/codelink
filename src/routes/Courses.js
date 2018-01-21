import React, { Component } from 'react'
import Button from 'material-ui/Button';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
// import Input, { InputLabel } from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import _ from 'lodash'
import * as firebase from 'firebase'
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
// import { ListItemText } from 'material-ui/List';
import Select from 'material-ui/Select';
import Checkbox from 'material-ui/Checkbox';

// add edit assignment

// 5. Student clicks on the assigned problem and is directed to the page to solve it.
// 6. Student correctly solves the assigned problem and is directed back to the assignments view. 
// 7. The word "COMPLETE" now shows up in the grid for the student for the solved problem.

// student empty / submit / completed

// assignment = open / closed
// assignment either problem / text question
// assignment click links to page to solve it (how do we track that?)


// problem and paths fixes
// add time tracking for assignments

// logging events
// pass course as prop
// refactor enrolled fetching

// add other people public paths

// I can't do much more testing until I can 
// - add problems to a path
// - view problems on a path
// - try to solve problems on a path as another user. 


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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

class Courses extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showModal: false,
      courses: {},
      courseName: '',
      password: '',
      paths: [],
    }
  }

  componentDidMount() {
    const { user } = this.props
    // fetch enrolled courses

    firebase.database().ref('paths').orderByChild('owner').equalTo(user.uid)
    .on('value', snapshot => {
      const paths = snapshot.val()

      if (paths) {
        this.setState({paths})
      }
    })

    firebase.database().ref('courses').orderByChild('isPublic').equalTo(true)
    .on('value', snapshot => {
      const publicCourses = snapshot.val()

      if (publicCourses) {
        this.setState({publicCourses})
      }
    })

    firebase.database().ref('courses').orderByChild('owner').equalTo(user.uid)
    .on('value', snapshot => {
      const myCourses = snapshot.val()

      if (myCourses) {
        this.setState({myCourses})
      }
    })
  }

  createCourse = () => {
    const { courses, password, courseName, editingKey } = this.state
    const { user } = this.props

    if (password && courseName) {
      const updates = {}

      let courseKey

      if (editingKey) {
        courseKey = editingKey
      } else {
        courseKey = firebase.database().ref('courses').push().key
      }

      updates['courses/' + courseKey] = { name: courseName, owner: user.uid, isPublic: false }
      updates['coursePasswords/' + courseKey] = password

      firebase.database().ref().update(updates)
      .then(() => this.setState({password: '', courseName: '', showModal: false, editingKey: ''}))
    }
  }

  closeModal = () => this.setState({showModal: false, courseName: ''})

  renderEnrolledCourses = () => {
    const { publicCourses } = this.state
    const { user } = this.props

    if (!user.courses || !publicCourses) {
      return false
    }

    const filtered = _.map(publicCourses, (course, courseKey) => ({...course, key: courseKey}))
      .filter(course => user.courses[course.key])

    return (
      <div>
        <h3>Courses I’m enrolled in</h3>
        <List className="table_body">
          {filtered.map((course,i) =>
            <ListItem key={i} className="table_row">
              <ListItemText style={{width:'30%'}} inset primary={course.name}/>
              <Button color="primary" raised className="table_row-edit" href={`/course/${course.key}`}>
                View
              </Button>
            </ListItem>
          )}
        </List>
      </div>
    )
  }

  renderMyCourses = () => {
    const { myCourses } = this.state

    if (!myCourses) {
      return false
    }

    return (
      <div>
        <h3>Courses I’m the instructor for</h3>
        <List className="table_body">
          {_.map(myCourses, (course, courseKey) =>
            <ListItem key={courseKey} className="table_row">
              <ListItemText style={{width:'30%'}} inset primary={course.name}/>
              <Button raised className="table_row-edit"
                onClick={() => this.setState({showModal: true, editingKey: courseKey, courseName: course.name})}>
                Edit
              </Button>
            </ListItem>
          )}
        </List>
      </div>
    )
  }

  renderPublicCourses = () => {
    const { publicCourses } = this.state
    const { user } = this.props

    if (!publicCourses) {
      return false
    }

    // filter with my current enrolled courses
    return (
      <div>
        <h3>Public courses available to join</h3>
        <List className="table_body">
          {_.map(publicCourses, (course, courseKey) =>
            <ListItem key={courseKey} className="table_row">
              <ListItemText style={{width:'30%'}} inset primary={course.name}/>
              <Button raised className="table_row-edit" href={`/course/${courseKey}`}>
                { user.uid === course.owner ? 'View' : 'Join'}
              </Button>
            </ListItem>
          )}
        </List>
      </div>
    )

  }

  handlePathsChange = event => {
    this.setState({ tag: new Set(event.target.value) });
  };

  render() {
    const { showModal, courses, courseName, password, paths, editingKey } = this.state
    const { classes } = this.props

    return (
      <div className="container">
        <div className="controllers">
          <Button raised className="controllers_button-edit" color="accent" onClick={() => this.setState({showModal: true})}>+ Add course</Button>
        </div>

        {this.renderEnrolledCourses()}
        {this.renderMyCourses()}
        {this.renderPublicCourses()}

        <Dialog open={showModal} onClose={this.closeModal} aria-labelledby="simple-dialog-title">
          <DialogTitle>{editingKey ? 'Editing course' : 'New course'}</DialogTitle>
          <DialogContent>
            <form className={classes.container}>
              <TextField
                id="name"
                label="Course name"
                className={classes.textField}
                value={courseName}
                onChange={e => this.setState({courseName: e.target.value})}
                margin="normal"
              />
              <TextField
                id="password"
                label="Course password"
                className={classes.textField}
                value={password}
                onChange={e => this.setState({password: e.target.value})}
                margin="normal"
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeModal} color="primary">
              Cancel
            </Button>
            <Button raised onClick={this.createCourse} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
} 

export default withStyles(styles)(Courses);
