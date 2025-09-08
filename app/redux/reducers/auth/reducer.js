import {Appearance} from 'react-native';
import types from './actions';

const initialState = {
  userData: {},
  accessToken: '',
  darkMode: Appearance.getColorScheme() == 'dark' ? true : false,
  walkThrough: true,
  lastScreen: '',
  activeScreen: 'Home',
  theme: 'systemDefault',
  shopSelected: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'persist/REHYDRATE':
      if (
        action.payload &&
        action.payload.auth &&
        action.payload.auth.introShown
      ) {
        return {
          ...state,
          ...action.payload.auth,
          introShown: false,
        };
      }
      return state;
    case types.SET_USER_DATA:
      return {
        ...state,
        userData: action.userData,
      };
    case types.SET_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.accessToken,
      };
    case types.SET_WALKTHROUGH:
      return {
        ...state,
        walkThrough: action.walkThrough,
      };
    case types.SET_LAST_SCREEN:
      return {
        ...state,
        lastScreen: action.lastScreen,
      };
    case types.LOGOUT:
      return {
        ...initialState,
        commonData: state.commonData,
      };
    case types.SET_DARK_MODE:
      return {
        ...state,
        darkMode: action.darkMode,
      };
    case types.SET_COMMON_DATA:
      return {
        ...state,
        commonData: action.commonData,
      };
    case types.SET_ACTIVESCREEN:
      return {
        ...state,
        activeScreen: action.activeScreen,
      };
    case types.SET_SHOP_SELECTED:
      return {
        ...state,
        shopSelected: action.shopSelected,
      };
  
    case types.SET_THEME:
      return {
        ...state,
        theme: action.theme,
      };
    default:
      return state;
  }
}
