import rootReducer from './reducers'
import { firebaseConfig } from './config'
import { createStore, applyMiddleware, compose } from 'redux'
import { reactReduxFirebase } from 'react-redux-firebase'
import { createLogger } from 'redux-logger';

import JSURL from 'jsurl'

// Add reactReduxFirebase store enhancer
const createStoreWithFirebase = compose(
  reactReduxFirebase(firebaseConfig)
)(createStore)

const numberOfInputs = window.showModelSolution ? 3 : 2
console.log(numberOfInputs)
let values = []
let markdownValues = []

for (let i = numberOfInputs; i > 0; i--) {
  markdownValues.push('')
  values.push('')
}

const { hash } = window.location

if (hash) {
  const withoutHash = hash.slice(1)
  const parsedWithJSURL = JSURL.tryParse(withoutHash)

  if (parsedWithJSURL) {
    if (parsedWithJSURL.code) {
      if (window.showModelSolution) {
        values = [
          ...parsedWithJSURL.code.slice(0,1),
          '',
          ...parsedWithJSURL.code.slice(1)
        ]
      } else {
        values = parsedWithJSURL.code
      }
    }

    if (parsedWithJSURL.markdown) {
      if (window.showModelSolution) {
        markdownValues = [
          ...parsedWithJSURL.markdown.slice(0,1),
          '',
          ...parsedWithJSURL.markdown.slice(1)
        ]
      } else {
        markdownValues = parsedWithJSURL.markdown
      }
    }
  } else {
    const parsed = {}
    withoutHash.split('&').forEach(undecoded => {
      const parts = undecoded.split('=')
      const array = parts[1].split(',').map(value => decodeURIComponent(value))
      
      parsed[parts[0]] = array
    })

    if (parsed.code) {
      if (window.showModelSolution) {
        values = [
          ...parsed.code.slice(0,1),
          '',
          ...parsed.code.slice(1)
        ]
      } else {
        values = parsed.code
      }
    }

    if (parsed.markdown) {
      if (window.showModelSolution) {
        markdownValues = [
          ...parsed.markdown.slice(0,1),
          '',
          ...parsed.markdown.slice(1)
        ]
      } else {
        markdownValues = parsed.markdown
      }
    }
  }
}

const initialState = {
  values,
  runFromIndex: null,
  results: [],
  markdownValues
}

const saveToFirebase = (getState, action) => {
  const { type, value = null } = action
  if (type === '@@reactReduxFirebase/LOGIN' || type === '@@reactReduxFirebase/SET_PROFILE') {
    return false
  }

  if (window.store) {
    const { firebase } = window.store
    const payload = {
      type,
      value,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    }
    const { user } = getState()

    if (user.uid) {
      payload.uid = user.uid
      payload.isAnonymous = user.isAnonymous
    }

    if (type === 'LOGIN') {
      payload.uid = action.uid
      payload.isAnonymous = action.isAnonymous
    }

    firebase.database().ref('logged_events').push(payload)
  }

  return true
}

const logger = createLogger({
  predicate: saveToFirebase
})

// Create store with reducers and initial state
const store = createStoreWithFirebase(
  rootReducer,
  {
    userCode: initialState
  },
  applyMiddleware(logger)
)

export default store
