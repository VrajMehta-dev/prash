const actions = {
  SET_LANGUAGE: 'auth/SET_LANGUAGE',
  SET_DEVICE_DEFAULT_LANGUAGE: 'auth/SET_DEVICE_DEFAULT_LANGUAGE',
  SET_LANGUAGE_LIST: 'auth/SET_LANGUAGE_LIST',
  SET_SELECTED_LANG: 'auth/SET_SELECTED_LANG',
  SELECT_LANGUAGE: 'auth/SELECT_LANGUAGE',
  UPDATE_LANGUAGE: 'auth/UPDATE_LANGUAGE',

  setLanguage: (code, languageJson) => dispatch =>
    dispatch({
      type: actions.SET_LANGUAGE,
      code,
      languageJson,
    }),
  setDeviceDefaultLanguage: bool => dispatch =>
    dispatch({
      type: actions.SET_DEVICE_DEFAULT_LANGUAGE,
      deviceDefaultLanguage: bool,
    }),
  setSelectedLanguage: name => dispatch =>
    dispatch({
      type: actions.SET_SELECTED_LANG,
      selectedLanguage: name,
    }),
  setLanguageList: data => dispatch =>
    dispatch({
      type: actions.SET_LANGUAGE_LIST,
      languageList: data,
    }),
  setSelectLanguage: selectLanguage => dispatch =>
    dispatch({
      type: actions.SELECT_LANGUAGE,
      selectLanguage,
    }),
  languageUpdate: updateLanguage => dispatch =>
    dispatch({
      type: actions.UPDATE_LANGUAGE,
      updateLanguage,
    }),
};

export default actions;
