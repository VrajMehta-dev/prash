const actions = {
  SET_USER_DATA: 'auth/SET_USER_DATA',
  SET_ACCESS_TOKEN: 'auth/SET_ACCESS_TOKEN',
  SET_WALKTHROUGH: 'auth/SET_WALKTHROUGH',
  LOGOUT: 'auth/LOGOUT',
  SET_DARK_MODE: 'auth/SET_DARK_MODE',
  SET_ACTIVESCREEN: 'auth/SET_ACTIVESCREEN',
  SET_LAST_SCREEN: 'auth/SET_LAST_SCREEN',
  SET_COMMON_DATA: 'auth/SET_COMMON_DATA',
  SET_THEME: 'auth/SET_THEME',
  SET_SHOP_SELECTED: 'auth/SET_SHOP_SELECTED',

  setUserData: data => dispatch => {
    dispatch({
      type: actions.SET_USER_DATA,
      userData: data,
    });
  },
  setAccessToken: accessToken => dispatch => {
    dispatch({
      type: actions.SET_ACCESS_TOKEN,
      accessToken,
    });
  },
  setWalkThrough: bool => dispatch => {
    dispatch({
      type: actions.SET_WALKTHROUGH,
      walkThrough: bool,
    });
  },
  logOut: () => (dispatch, getState) => {
    dispatch({
      type: actions.LOGOUT,
    });
  },
  setDarkMode: darkMode => dispatch => {
    dispatch({
      type: actions.SET_DARK_MODE,
      darkMode,
    });
  },
  setActiveScreen: data => dispatch =>
    dispatch({
      type: actions.SET_ACTIVESCREEN,
      activeScreen: data,
    }),
  setLastScreen: lastScreen => dispatch => {
    dispatch({
      type: actions.SET_LAST_SCREEN,
      lastScreen,
    });
  },
  setCommonData: data => dispatch => {
    dispatch({
      type: actions.SET_COMMON_DATA,
      commonData: data,
    });
  },
  setShopSelected: data => dispatch => {
    dispatch({
      type: actions.SET_SHOP_SELECTED,
      shopSelected: data,
    });
  },
  setTheme: theme => dispatch => {
    dispatch({
      type: actions.SET_THEME,
      theme,
    });
  },
};

export default actions;
