export const UPDATE_CODE = 'UPDATE_CODE'
export const UPDATE_INDEX = 'UPDATE_INDEX'
export const UPDATE_RESULTS = 'UPDATE_RESULTS'
export const LOGIN = 'LOGIN'
export const UPDATE_MARKDOWN = 'UPDATE_MARKDOWN'

export const updateCode = (value, index) => ({
  type: UPDATE_CODE,
  value,
  index
})

export const updateMarkdown = (value, index) => ({
  type: UPDATE_MARKDOWN,
  value,
  index
})

export const updateIndex = index => ({
  type: UPDATE_INDEX,
  index
})

export const login = (uid, isAnonymous) => ({
  type: LOGIN,
  uid,
  isAnonymous
})

export const updateResults = (value, index) => ({
  type: UPDATE_RESULTS,
  value,
  index
})
