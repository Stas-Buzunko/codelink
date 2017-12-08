import { LOGIN } from '../actions/'


const initialState = {
  uid: null,
  isAnonymous: false
}

const userReducer = (state = initialState, action) => {
  switch(action.type){
    case LOGIN:    
      return {
        ...state,
        uid: action.uid,
        isAnonymous: action.isAnonymous
      }
    default:
      return state;
  }  
};

export default userReducer
