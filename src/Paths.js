import React from 'react'

const paths = [
  {name: 'Sum', level: 1},
  {name: 'Subtract', level: 1},
  {name: 'Divide', level: 2},
  {name: 'If then', level: 2}
]

const paths2 = [
  {name: 'Awesome problem', level: 1},
  {name: 'Http access', level: 1},
]

const Paths = () =>
  <div className="container">
    <div className="controllers">
      <button className="controllers_button">+ Add Path</button>
      <button className="controllers_button">+ Add Problem</button>
    </div>

    <div>
      <div className="table_header">
        <h3 style={{width:'60%'}}>Intro to Python Path</h3>
        <h3 style={{width:'11%',textAlign:'center'}}>Level</h3>
      </div>
      <div className="table_body">
        {paths.map((path, i) =>
          <div key={i} className="table_row">
            <h4 style={{width:'30%'}}>{path.name}</h4>
            <button className="table_row-edit">
              <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>Edit
            </button>
            <span className="table_row-updown">Upvote</span>
            <span className="table_row-updown">Downvote</span>
            <span className="table_row-lvl">{path.level}</span>
          </div>
        )}
      </div>
    </div>
    
    <div>
      <h3>Problems not on a path</h3>
      <div className="table_body">
        {paths2.map((path, i) =>
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

export default Paths
