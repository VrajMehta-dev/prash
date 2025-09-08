import {combineReducers} from 'redux';
import auth from './auth/reducer';
import notification from './notification/reducer';
import language from './language/reducers';
import socket from './socket/reducer';

const rootReducer = combineReducers({
  auth,
  notification,
  language,
  socket,
});

export default rootReducer;
