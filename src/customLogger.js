import printBuffer from 'redux-logger/src/core';
import { timer } from 'redux-logger/src/helpers';
import defaults from 'redux-logger/src/defaults';

const createLoggerWithFirebase = (options = {}) => {
  const loggerOptions = Object.assign({}, defaults, options);

  const {
    logger,
    stateTransformer,
    errorTransformer,
    predicate,
    logErrors,
    diffPredicate,
  } = loggerOptions;

  // Return if 'console' object is not defined
  if (typeof logger === 'undefined') {
    return () => next => action => next(action);
  }
  // Detect if 'createLogger' was passed directly to 'applyMiddleware'.
  if (options.getState && options.dispatch) {
    return () => next => action => next(action);
  }

  const logBuffer = [];

  return ({getState}) => next => (action) => {
    // Exit early if predicate function returns 'false'
    if (typeof predicate === 'function' && !predicate(getState, action)) {
      return next(action);
    }

    const logEntry = {};

    logBuffer.push(logEntry);

    logEntry.started = timer.now();
    logEntry.startedTime = new Date();
    logEntry.prevState = stateTransformer(getState());
    logEntry.action = action;

    let returnedValue;
    if (logErrors) {
      try {
        returnedValue = next(action);
      } catch (e) {
        logEntry.error = errorTransformer(e);
      }
    } else {
      returnedValue = next(action);
    }

    logEntry.took = timer.now() - logEntry.started;
    logEntry.nextState = stateTransformer(getState());

    const diff = loggerOptions.diff && typeof diffPredicate === 'function'
      ? diffPredicate(getState, action)
      : loggerOptions.diff;

    if (window.store) {
      const { firebase } = window.store
      const { type, value = null } = action
      const payload = { type, value }
      const { user } = getState()

      if (user.uid) {
        payload.uid = user.uid
        payload.isAnonymous = user.isAnonymous
      }

      firebase.database().ref('StateChanges').push(payload)
    }
    
    printBuffer(logBuffer, Object.assign({}, loggerOptions, { diff }));
    logBuffer.length = 0;

    if (logEntry.error) throw logEntry.error;
    return returnedValue;
  };
} 

// eslint-disable-next-line consistent-return
const defaultLogger = ({ dispatch, getState } = {}) => {
  if (typeof dispatch === 'function' || typeof getState === 'function') {
    return createLoggerWithFirebase()({ dispatch, getState });
  }
};

export { defaults, createLoggerWithFirebase, defaultLogger as logger };

export default defaultLogger;