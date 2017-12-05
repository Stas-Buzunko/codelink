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

let values = []
let markdownValues = []

const { hash } = window.location

if (hash) {
  const withoutHash = hash.slice(1)
  const parsedWithJSURL = JSURL.tryParse(withoutHash)

  if (parsedWithJSURL) {
    values = parsedWithJSURL.code || []
    markdownValues = parsedWithJSURL.markdown || []
  } else {
    const parsed = {}
    withoutHash.split('&').forEach(undecoded => {
      const parts = undecoded.split('=')
      const array = parts[1].split(',').map(value => decodeURIComponent(value))
      
      parsed[parts[0]] = array
    })

    values = parsed.code || []
    markdownValues = parsed.markdown || []
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
    const payload = { type, value }
    const { user } = getState()

    if (user.uid) {
      payload.uid = user.uid
      payload.isAnonymous = user.isAnonymous
    }

    if (type === 'LOGIN') {
      payload.uid = action.uid
      payload.isAnonymous = action.isAnonymous
    }

    firebase.database().ref('StateChanges').push(payload)
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
