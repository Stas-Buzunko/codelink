import rootReducer from './reducers'
import { firebaseConfig } from './config'
import { createStore, applyMiddleware, compose } from 'redux'
import { reactReduxFirebase } from 'react-redux-firebase'
import logger from './customLogger'
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

// Create store with reducers and initial state
const store = createStoreWithFirebase(
  rootReducer,
  {
    userCode: initialState
  },
  applyMiddleware(logger)
)

export default store
