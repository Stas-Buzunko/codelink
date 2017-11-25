import { combineReducers } from 'redux'
import userCode from './userCodeReducer'
import userReducer from './userReducer'
import { firebaseStateReducer } from 'react-redux-firebase'

const rootReducer = combineReducers({
  firebase: firebaseStateReducer,
  userCode,
  user: userReducer
})

export default rootReducer
