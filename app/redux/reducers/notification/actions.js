const actions = {
  SET_FCM_TOKEN: 'auth/SET_FCM_TOKEN',
  SET_FCM_TOKEN_CALL: 'auth/SET_FCM_TOKEN_CALL',
  SET_ON_NOTIFICATION_OPEN: 'auth/SET_ON_NOTIFICATION_OPEN',
  SET_UPDATE_NOTIFICATION: 'auth/SET_UPDATE_NOTIFICATION',
  SET_ACTION_TYPE: 'auth/SET_ACTION_TYPE',
  CLEAR_DATA: 'auth/CLEAR_DATA',
  SET_UPDATE_NOTIFICATION_COUNT: 'auth/SET_UPDATE_NOTIFICATION_COUNT',

  setFcmToken: token => dispatch =>
    dispatch({
      type: actions.SET_FCM_TOKEN,
      fcmToken: token,
    }),
  setFcmTokenCall: bool => dispatch =>
    dispatch({
      type: actions.SET_FCM_TOKEN_CALL,
      fcmTokenCall: bool,
    }),
  onNotificationOpen: data => dispatch =>
    dispatch({
      type: actions.SET_ON_NOTIFICATION_OPEN,
      notificationOpen: data,
    }),
  setActionType: type => dispatch =>
    dispatch({
      type: actions.SET_ACTION_TYPE,
      actionType: type,
    }),
  updateNotification: data => dispatch =>
    dispatch({
      type: actions.SET_UPDATE_NOTIFICATION,
      updateNotification: data,
    }),
  setUpdateNotificationCount: data => dispatch =>
    dispatch({
      type: actions.SET_UPDATE_NOTIFICATION_COUNT,
      updateNotificationCount: data,
    }),
  clearData: () => (dispatch, getState) => {
    dispatch({
      type: actions.CLEAR_DATA,
    });
  },
};

export default actions;
