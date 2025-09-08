import types from './actions';

const initialState = {
  code: 'en',
  selectedLanguage: 'English (US)',
  languageData: {},
  languageJson: {},
  languageList: [],
  selectLanguage: false,
  updateLanguage: false,
  deviceDefaultLanguage: true,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_LANGUAGE:
      return {
        ...state,
        code: action.code,
        languageData: action.languageData,
        languageJson: action.languageJson,
      };
    case types.SET_DEVICE_DEFAULT_LANGUAGE:
      return {
        ...state,
        deviceDefaultLanguage: action.deviceDefaultLanguage,
      };
    case types.SET_SELECTED_LANG:
      return {
        ...state,
        selectedLanguage: action.selectedLanguage,
      };
    case types.SELECT_LANGUAGE:
      return {
        ...state,
        selectLanguage: action.selectLanguage,
      };
    case types.SET_LANGUAGE_LIST:
      return {
        ...state,
        languageList: action.languageList,
      };
    case types.UPDATE_LANGUAGE:
      return {
        ...state,
        updateLanguage: action.updateLanguage,
      };
    default:
      return state;
  }
}
