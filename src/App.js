import React, { Component } from 'react';
import * as firebase from 'firebase'
import { login } from './actions'
import { connect } from 'react-redux'
import { BrowserRouter, Route } from "react-router-dom"
import Home from './routes/Home'
import Statistics from './routes/Statistics'
import Paths from './routes/Paths'
import Courses from './routes/Courses'
import NewProblem from './routes/NewProblem'
import EditProblem from './routes/EditProblem'
import PrivateRoute from './utils/PrivateRoute'
import AppFrame from './AppFrame'
import Course from './routes/Course'

class App extends Component {
  constructor(props) {
    super(props)

    let user = localStorage.getItem('codelinkUser')
    if (user) {
      user = JSON.parse(user)
    }

    this.state = {
      user,
    }
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {

        // User is signed in.
        // check if it's google login, not anonymous
        if (!user.isAnonymous) {

          firebase.database().ref('users/' + user.uid).on('value', snapshot => {
            let dbUser = snapshot.val()

            if (dbUser) {
              dbUser = {...dbUser, uid: user.uid}

              this.setState({user: dbUser})
              localStorage.setItem('codelinkUser', JSON.stringify(dbUser))
            }
          })

          firebase.database().ref('logged_events').push(`User ${user.uid} has been logged in.`)
        } else {
          firebase.database().ref('logged_events').push(`Anonymous user ${user.uid} has been logged in.`)
          // this.props.login(uid, isAnonymous)
        }
      } else {
        // No user is signed in.
        this.setState({user: null})
        localStorage.removeItem('codelinkUser')

        // if not signed in, then log in him Anonymously
        firebase.auth().signInAnonymously()
        .catch(error => {
          const { code: errorCode, message: errorMessage } = error
          // Handle Errors here.

          console.log(errorCode, errorMessage)
        });
      }
    });
  }

  loginWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
    .then(({user}) => firebase.database().ref('users/' + user.uid).update({name: user.displayName}))
    .catch(error  => console.log(error.message))
  }

  render() {
    const { user } = this.state

    return (
      <div>
        <BrowserRouter>
          <AppFrame user={user} onLogout={() => firebase.auth().signOut()} onLogin={this.loginWithGoogle} >
            {/*<TopMenu
                          user={user}
                          onLogout={() => firebase.auth().signOut()}
                          onLogin={this.loginWithGoogle} />*/}
            <div className="main-desk">
              {/*user &&
                <div className="left_menu">
                  <Link to="/">
                    <h4>
                      <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>
                      Main
                    </h4>
                  </Link>
                  <Link to="/paths">
                    <h4>
                      <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>
                      Paths
                    </h4>
                  </Link>
                  <Link to="/courses">
                    <h4>
                      <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>
                      Courses
                    </h4>
                  </Link>
                  <Link to="/statistics">
                    <h4>
                      <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>
                      Statistics
                    </h4>
                  </Link>
                </div>
              */}

              <Route exact path="/" component={Home}/>
              <PrivateRoute path="/courses" component={Courses} user={user} />
              <PrivateRoute path="/course/:id" component={Course} user={user} />
              <PrivateRoute path="/paths" component={Paths} user={user} />
              <PrivateRoute path="/statistics" component={Statistics} user={user} />
              <PrivateRoute path="/new" exact component={NewProblem} user={user} />
              <PrivateRoute path="/edit/:id" exact component={EditProblem} user={user} />

            </div>
          </AppFrame>
        </BrowserRouter>
      </div>
    )
  }
}

export default connect(null, { login })(App)
