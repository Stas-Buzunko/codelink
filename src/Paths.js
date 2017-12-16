import React, { Component } from 'react'
import _ from 'lodash'

const paths = {uniqueKey: {
  title: 'Intro to Python Path',
  problems: [
    {name: 'Sum', level: 1, priority: 1},
    {name: 'Subtract', level: 1, priority: 2},
    {name: 'Divide', level: 2, priority: 3},
    {name: 'If then', level: 2, priority: 4}
  ],
  showProblems: false
}}

const paths2 = [{name: 'Awesome problem', level: 1}, {name: 'Http access', level: 1}]

class Paths extends Component {
  constructor(props) {
    super(props)

    this.state = {
      paths,
      notListedProblems: paths2
    }
  }

  componentWillMount() {
    // setup firebase listener here
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
    

  render() {
    const { notListedProblems, paths } = this.state
console.log(paths)
    return (
      <div className="container">
        <div className="controllers">
          <button className="controllers_button">+ Add Path</button>
          <button className="controllers_button" onClick={this.addNewProblem}>+ Add Problem</button>
        </div>

        {_.map(paths, (path, key) =>
          <div key={key}>
            <div className="table_header">
              <h3 style={{width:'60%'}} onClick={() => this.togglePath(key)}>{path.title}</h3>
              <h3 style={{width:'11%',textAlign:'center'}}>Level</h3>
            </div>
            {path.showProblems &&
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
            {notListedProblems.map((path, i) =>
              <div key={i} className="table_row">
                <h4 style={{width:'30%'}}>{path.name}</h4>
                <button className="table_row-edit">
                  <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>Edit
                </button>
                <button className="table_row-edit" style={{width:'20%',margin:'0 5%'}}>+ Add to path</button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
} 

export default Paths
