import types from './actions';

const initialState = {
  fcmToken: '',
  fcmTokenCall: false,
  notificationOpen: {},
  updateNotification: {},
  actionType: '',
  updateNotificationCount: '',
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_FCM_TOKEN:
      return {
        ...state,
        fcmToken: action.fcmToken,
      };
    case types.SET_FCM_TOKEN_CALL:
      return {
        ...state,
        fcmTokenCall: action.fcmTokenCall,
      };
    case types.SET_ON_NOTIFICATION_OPEN:
      return {
        ...state,
        notificationOpen: action.notificationOpen,
      };
    case types.SET_UPDATE_NOTIFICATION:
      return {
        ...state,
        updateNotification: action.updateNotification,
      };
    case types.SET_ACTION_TYPE:
      return {
        ...state,
        actionType: action.actionType,
      };
    case types.CLEAR_DATA:
      return {
        ...initialState,
        fcmToken: state.fcmToken,
      };
    case types.SET_UPDATE_NOTIFICATION_COUNT:
      return {
        ...state,
        updateNotificationCount: action.updateNotificationCount,
      };
    default:
      return state;
  }
}
