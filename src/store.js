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

if (window.location.hash) {
  const withoutHash = window.location.hash.slice(1)
  const parsedWithJSURL = JSURL.tryParse(withoutHash)

  values = parsedWithJSURL
    ? parsedWithJSURL
    : withoutHash.split(',').map(undecoded => decodeURIComponent(undecoded))
}

const initialState = {
  values,
  runFromIndex: null,
  results: []
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
