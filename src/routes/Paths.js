import React, { Component } from 'react'
import _ from 'lodash'
import { Link } from "react-router-dom"
import * as firebase from 'firebase'
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';
import Tabs, { Tab } from 'material-ui/Tabs';
import KeyboardArrowDown from 'material-ui-icons/KeyboardArrowDown'
import KeyboardArrowUp from 'material-ui-icons/KeyboardArrowUp'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Divider from 'material-ui/Divider'

class Paths extends Component {
  constructor(props) {
    super(props)

    this.state = {
      paths: {},
      problems: {},
      showModal: false,
      pathName: '',
      isFeatured: false,
      showPathModal: false,
      selectedPath: '',
      problemKey: '',
      isLoadingPaths: true,
      isLoadingProblems: true,
      showAllProblems: 0
    }
  }

  componentDidMount() {
    const { user } = this.props
    // setup firebase listener here
    this.problemsRef = firebase.database().ref('problems').orderByChild('owner').equalTo(user.uid)
    this.pathsRef = firebase.database().ref('paths').orderByChild('owner').equalTo(user.uid)

    this.problemsRef.on('value', snapshot => {
      const problems = snapshot.val()

      if (problems) {
        this.setState(state => ({problems: problems}))
      }

      if (this.state.isLoadingProblems) {
        this.setState({isLoadingProblems: false})
      }
    })

    this.pathsRef.on('value', snapshot => {
      const paths = snapshot.val()

      if (paths) {
        this.setState({paths})
      }

      if (this.state.isLoadingPaths) {
        this.setState({isLoadingPaths: false})
      }
    })
  }

  componentWillUnmount() {
    this.problemsRef.off()
    this.pathsRef.off()
  }

  addNewProblem = () => {
    const { problems } = this.state

    this.setState({problems: [...problems, {name: 'New problem', level: 1}]})
  }

  moveProblem = (pathKey, problemKey, change) => {
    const currentPath = _.cloneDeep(this.state.paths[pathKey])
    const updates = {}

    const newValue = currentPath.pathProblems[problemKey] + change

    updates[problemKey] = newValue

    const oldKey = Object.keys(currentPath.pathProblems).find(key => currentPath.pathProblems[key] === newValue)



    updates[problemKey] = currentPath.pathProblems[problemKey] + change
    updates[oldKey] = currentPath.pathProblems[oldKey] - change

    firebase.database().ref('paths/' + pathKey + '/pathProblems/').update(updates)
  }

  togglePath = pathKey => {
    const { paths } = this.state
    const path = paths[pathKey]

    this.setState({
      paths: {
        ...paths,
        [pathKey]: {
          ...path,
          showProblems: !path.showProblems
        }
      }
    })
  }

  createPath = () => {
    const { pathName, isFeatured } = this.state

    if (!pathName) {
      return alert('Please, name your path')
    }

    const { uid } = this.props.user
    const pathKey = firebase.database().ref('paths').push().key

    firebase.database().ref('paths/' + pathKey).set({
      title: pathName,
      owner: uid,
      assistants: null,
      isFeatured
    })
    .then(() => {
      this.setState({showModal: false, pathName: '', isFeatured: false})
      firebase.database().ref('logged_events').push(`Path ${pathKey} has been created by ${uid}`)
    })
  }

  addProblemToPath = () => {
    const { selectedPath, problemKey, paths } = this.state
    const order = paths.pathProblems && Object.keys(paths.pathProblems).length + 1 || 0

    firebase.database().ref('paths/' + selectedPath + '/pathProblems/' + problemKey)
    .set(order)
    .then(this.closePathModal)
  }

  closePathModal = () =>
    this.setState({showPathModal: false, problemKey: '', selectedPath: ''})

  renderProblems = () => {
    const { showAllProblems, problems, paths } = this.state
    let problemsToShow = _.map(problems, ((path, key) => ({...path, key})))

    if (!showAllProblems) {
      problemsToShow = problemsToShow.filter(problem =>
        !_.some(paths, path => path.pathProblems && path.pathProblems[problem.key] !== undefined)
      )
    }

    return (
      <List className="table_body">
        {problemsToShow.map(problem =>
          <ListItem key={problem.key} className="table_row">
            <ListItemText style={{width:'30%'}} inset primary={problem.name}/>
            <Link to={`/edit/${problem.key}`}>
              <Button raised className="table_row-edit">
                <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>Edit
              </Button>
            </Link>
            <Button
              raised
              color="accent"
              onClick={() => this.setState({showPathModal: true, problemKey: problem.key})}
              className="table_row-edit"
              style={{width:'20%',margin:'0 5%'}}
            >+ Add to path</Button>
          </ListItem>
        )}
      </List>
    )
  }

  renderPaths = () =>  {
    const { paths, problems } = this.state
    const list = []

    _.forEach(paths, (path, key) => {
      list.push(
        <ListItem button onClick={() => this.togglePath(key)} >
          <ListItemText inset primary={path.title} style={{width:'60%'}}/>
          {path.pathProblems &&
            <ListItemIcon>
              {path.showProblems ? <ExpandLess /> : <ExpandMore />}
            </ListItemIcon>
          }
          <ListItemText inset primary='Level' onClick={() => this.togglePath(key)} style={{width:'11%',textAlign:'center'}}/>
        </ListItem>
      )

      if (path.pathProblems && path.showProblems) {
        list.push(
          <Collapse component="li" in={true} timeout="auto" unmountOnExit>
            <List disablePadding style={{paddingLeft: '2rem'}}>
              {_.map(path.pathProblems, (order, problemKey) => ({ order, ...problems[problemKey], problemKey }))
                .sort((a, b) => a.order - b.order)
                .map((problem, i) =>
                  <ListItem button key={i} className="table_row" >
                    <ListItemText inset primary={problem.name} style={{width:'30%'}} />
                    <Button className="table_row-edit">
                      <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>Edit
                    </Button>
                    {i !== 0 &&
                      <ListItemIcon className="table_row-updown" onClick={() => this.moveProblem(key, problem.problemKey, -1)}>
                        <KeyboardArrowUp />
                      </ListItemIcon>
                    }
                    {i !== Object.keys(path.pathProblems).length - 1 &&
                      <ListItemIcon className="table_row-updown" onClick={() => this.moveProblem(key, problem.problemKey, 1)}>
                        <KeyboardArrowDown />
                      </ListItemIcon>
                    }
                    <ListItemText className="table_row-lvl" primary={problem.level} />
                  </ListItem>
              )}
            </List>
          </Collapse>
        )
      }
    })
      
    return (
      <List className="table_body">
        {list}
      </List>
    )
  }

  render() {
    const { problems, paths, showModal, pathName, isFeatured, showPathModal, isLoadingProblems, isLoadingPaths, showAllProblems } = this.state
    const { classes } = this.props

    if (isLoadingPaths || isLoadingProblems) {
      return <div>Loading</div>
    }

    return (
      <div className="container">
        <Dialog open={showModal} onClose={() => this.setState({showModal: false})} aria-labelledby="simple-dialog-title">
          <DialogContent>
            <input value={pathName} onChange={e => this.setState({pathName: e.target.value})} placeholder="Path name" />
            <p>Is featured? </p>
            <input type="checkbox" value={isFeatured} onChange={() => this.setState({isFeatured: !isFeatured})} />
            <button onClick={this.createPath}>Save</button>
          </DialogContent>
        </Dialog>
        <Dialog open={showPathModal} onClose={this.closePathModal} aria-labelledby="simple-dialog-title">
          <DialogTitle>Choose a path</DialogTitle>
          <DialogContent>
            <form className={classes.container}>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-simple">Path</InputLabel>
                <Select
                  native
                  value={this.state.selectedPath}
                  onChange={e => this.setState({selectedPath: e.target.value})}
                  input={<Input id="age-native-simple" />}
                >
                  <option value='' />
                  {_.map(paths, (path, key) =>
                    <option key={key} value={key}>{path.title}</option>
                  )}
                </Select>
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closePathModal} color="primary">
              Cancel
            </Button>
            <Button onClick={this.addProblemToPath} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
        <div className="controllers">
          <Button color="accent" raised className="controllers_button" onClick={() => this.setState({showModal: true})}>+ Add Path</Button>
          <Link to='/new'><Button color="accent" raised className="controllers_button">+ Add Problem</Button></Link>
        </div>

        <div>
          <h3>Your paths</h3>
          {this.renderPaths()}
        </div>
        
        <Divider />
        <div>
          <Tabs
            value={showAllProblems}
            onChange={(e, i) => this.setState({showAllProblems: i})}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >
            <Tab label="Problems not on path" />
            <Tab label="All problems" />
          </Tabs>

          {this.renderProblems()}
        </div>
      </div>
    )
  }
}

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
});

export default withStyles(styles)(Paths);
