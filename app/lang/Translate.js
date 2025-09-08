/* eslint-disable global-require */
/* eslint-disable quotes */
import i18n from 'i18n-js';
import actions from '@redux/reducers/language/actions';

const translationGetters = {
  en: () => require('./en.json'),
  hi: () => require('./hi.json'),
};

export const translate = (key, config) => {
  if (!config) {
    config = {};
  }
  config.defaultValue = key;
  return i18n.t(key, config);
};

const setI18nConfig = (language = 'en-Us', store, bool, lang) => {
  const isRTL = false;
  let appLanguage = language;
  if (language === null) {
    appLanguage = 'en-US';
    store.dispatch({
      type: actions.SET_LANGUAGE,
      code: appLanguage,
    });
  }

  console.log('appLanguage', appLanguage);
  console.log('isRTL', isRTL);

  const ReactNative = require('react-native');
  try {
    ReactNative.I18nManager.allowRTL(isRTL);
    ReactNative.I18nManager.forceRTL(isRTL);
  } catch (e) {
    console.log('Error in RTL', e);
  }
  const {
    language: {languageJson},
  } = store.getState();
  console.log('🚀 ~ setI18nConfig ~ languageJson:', languageJson);
  i18n.translations = {[appLanguage]: languageJson};
  i18n.locale = appLanguage;
  store.dispatch({
    type: actions.UPDATE_LANGUAGE,
    updateLanguage: !lang,
  });
};

export const initTranslate = (store, bool = false) => {
  const {
    language: {code, updateLanguage},
  } = store.getState();
  setI18nConfig(code, store, bool, updateLanguage);
};
