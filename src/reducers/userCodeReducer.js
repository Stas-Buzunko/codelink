import { UPDATE_CODE, UPDATE_INDEX, UPDATE_RESULTS } from '../actions/' 

const initialState = {
  values: [],
  runFromIndex: null,
  results: []
}

const userCode = (state = initialState, action) => {
  switch(action.type){
    case UPDATE_CODE:    
      return {
        ...state,
        values: [
          ...state.values.slice(0, action.index),
          action.value,
          ...state.values.slice(action.index + 1)
        ]
      }
    case UPDATE_INDEX:
      return {
        ...state,
        runFromIndex: action.index
      }
    case UPDATE_RESULTS:
      return {
        ...state,
        results: [
          ...state.results.slice(0, action.index),
          action.value,
          ...state.results.slice(action.index + 1)
        ],
        runFromIndex: null
      }
    default:
      return state;
  }  
};

export default userCode
