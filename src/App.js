import React, { Component } from 'react';
import * as firebase from 'firebase'
import { login } from './actions'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Link } from "react-router-dom"
import Home from './Home'
import Statistics from './Statistics'
import Paths from './Paths'
import Courses from './Courses'
import PrivateRoute from './PrivateRoute'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      user: null
    }
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        // check if it's google login, not anonymous

        if (!user.isAnonymous) {
          console.log(2)
          this.setState({user})
        } else {
          console.log(1)
          firebase.database().ref('Logs').push(`Anonymous user ${user.uid} has been logged in.`)
          // this.props.login(uid, isAnonymous)
        }
      } else {
        // No user is signed in.
        this.setState({user: null})

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
    firebase.auth().signInWithPopup(provider).then((result) =>  {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const token = result.credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // ...
    }).catch((error)  => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      const credential = error.credential;
      // ...
    });
  }

  render() {
    const { user } = this.state

    return (
      <div>
        <BrowserRouter>
          <div>
            <div className="top_menu">
              {!user
                ? <button onClick={this.loginWithGoogle}>Login</button>
                : <button onClick={() => firebase.auth().signOut()}>Logout</button>
              }
              {user &&
                <div className="left_menu">
                  <Link to="/">Main</Link>
                  <Link to="/paths">Paths</Link>
                  <Link to="/courses">Courses</Link>
                  <Link to="/statistics">Statistics</Link>
                </div>
              }
            </div>

            <Route exact path="/" component={Home}/>
            <PrivateRoute path="/courses" component={Courses} user={user} />
            <PrivateRoute path="/paths" component={Paths} user={user} />
            <PrivateRoute path="/statistics" component={Statistics} user={user} />
          </div>
        </BrowserRouter>
      </div>
    )
  }
}

export default connect(null, { login })(App)
