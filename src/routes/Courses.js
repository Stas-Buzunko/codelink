import React from 'react'

const courses = ['Psychology','Physics','Intro to Games','Statistics']
const courses2 = ['Intro to Python','Machine Learning']

const Courses = () =>
  <div className="container">
    <div className="controllers">
      <button className="controllers_button">+ Add course</button>
    </div>
    <div>
      <h3>Courses I’m enrolled in</h3>
      <div className="table_body">
        {courses.map((course,i) =>
          <div key={i} className="table_row">
            <h4 style={{width:'30%'}}>{course}</h4>
            <button className="table_row-edit">
              <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>Edit
            </button>
          </div>
        )}
      </div>
    </div>

    <div>
      <h3>Courses I’m the instructor for</h3>
      <div className="table_body">
        {courses2.map((course,i) =>
          <div key={i} className="table_row">
            <h4 style={{width:'30%'}}>{course}</h4>
            <button className="table_row-edit" style={{backgroundColor:'blue'}}>
              View
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

export default Courses
