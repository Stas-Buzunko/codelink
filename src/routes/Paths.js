import React, { Component } from 'react'
import _ from 'lodash'
import { Link } from "react-router-dom"
import * as firebase from 'firebase'
import Dialog, { DialogContent } from 'material-ui/Dialog';

class Paths extends Component {
  constructor(props) {
    super(props)

    this.state = {
      paths: {},
      notListedProblems: {},
      showModal: false,
      pathName: '',
      isFeatured: false
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
        this.setState({notListedProblems: problems})
      }
    })

    this.pathsRef.on('value', snapshot => {
      const paths = snapshot.val()

      if (paths) {
        this.setState({paths})
      }
    })
  }

  componentWillUnmount() {
    this.problemsRef.off()
    this.pathsRef.off()
  }

  addNewProblem = () => {
    const { notListedProblems } = this.state

    this.setState({notListedProblems: [...notListedProblems, {name: 'New problem', level: 1}]})
  }

  moveProblem = (pathKey, oldIndex, newIndex) => {
    const currentPath = _.cloneDeep(this.state.paths[pathKey])

    currentPath.problems[oldIndex] = {
      ...currentPath.problems[oldIndex],
      priority: newIndex
    }

    currentPath.problems[newIndex] = {
      ...currentPath.problems[newIndex],
      priority: oldIndex
    }

    // update firebase here instead

    this.setState({
      paths: {
        ...this.state.paths,
        [pathKey]: currentPath
      }
    })
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

    firebase.database().ref('paths').push({
      title: pathName,
      owner: uid,
      assistants: null,
      isFeatured
    })
    .then(() => this.setState({showModal: false, pathName: '', isFeatured: false}))
  }
    

  render() {
    const { notListedProblems, paths, showModal, pathName, isFeatured } = this.state

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
        <div className="controllers">
          <button className="controllers_button" onClick={() => this.setState({showModal: true})}>+ Add Path</button>
          <Link to='/new'><button className="controllers_button">+ Add Problem</button></Link>
        </div>

        {_.map(paths, (path, key) =>
          <div key={key}>
            <div className="table_header">
              <h3 style={{width:'60%'}} onClick={() => this.togglePath(key)}>{path.title}</h3>
              <h3 style={{width:'11%',textAlign:'center'}}>Level</h3>
            </div>
            {path.problems && path.showProblems &&
              <div className="table_body">
                {path.problems.sort((a,b) => a.priority - b.priority).map((problem, i) =>
                  <div key={i} className="table_row">
                    <h4 style={{width:'30%'}}>{problem.name}</h4>
                    <button className="table_row-edit">
                      <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>Edit
                    </button>
                    <span className="table_row-updown" onClick={() => this.moveProblem(key, i, i - 1)}>Move up</span>
                    <span className="table_row-updown" onClick={() => this.moveProblem(key, i, i + 1)}>Move down</span>
                    <span className="table_row-lvl">{problem.level}</span>
                  </div>
                )}
              </div>
            }
          </div>
        )}
        
        
        <div>
          <h3>Problems not on a path</h3>
          <div className="table_body">
            {_.map(notListedProblems, ((path, key) =>
              <div key={key} className="table_row">
                <h4 style={{width:'30%'}}>{path.name}</h4>
                <Link to={`/edit/${key}`}>
                  <button className="table_row-edit">
                    <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>Edit
                  </button>
                </Link>
                <button className="table_row-edit" style={{width:'20%',margin:'0 5%'}}>+ Add to path</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
} 

export default Paths
