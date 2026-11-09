const devMode = __DEV__;
// const baseUrl = devMode
// ? 'https://staging-api.letsgoplan.com/v1'
//   : 'https://api.letsgoplan.com/v1';
// const baseUrl = 'http://192.168.1.81:9000/v1'; // Jainam
// const baseUrl = 'http://192.168.1.96:5000/v1'; // Ruchit
// const baseUrl = 'http://192.168.0.188:5000/v1'; // Tejas bhai
// const baseUrl = 'https://staging-api.letsgoplan.com/v1';

// const baseUrl = 'https://phpl.paruluniversity.ac.in/api/';
// const baseUrl2 = 'https://prash.paruluniversity.ac.in/api/';
// Environment is a build-time switch (app/config/env.js), flipped on the `uat` branch.
import {IS_UAT as isUat} from '@config/env';
const baseUrl2 = 'https://test-prash.aystera.com/api/';
const baseUrl = isUat
  ? baseUrl2
  : 'https://prash.paruluniversity.ac.in/api/';

// const webUrl = 'https://staging.letsgoplan.com/';
const webUrl = 'https://letsgoplan.com/';

// OTA update server (Hot Updater). UAT only for now; null disables OTA (prod until its server exists).
// apiKey is a read-only client key, not the admin token.
const ota = isUat
  ? {
      baseURL: 'https://test-prash.aystera.com/ota/hot-updater',
      apiKey: 'fSQ8LeD9UaDfIprfOMTQGval_WnYAijYjqT2TS9dvWc',
    }
  : null;

const BaseSetting = {
  ota,
  // JSON {android:{min}, ios:{min}}; UAT only for now (null = never force-update)
  versionUrl: isUat ? 'https://test-prash.aystera.com/mobile/app-version.json' : null,
  baseUrl: baseUrl,
  api: baseUrl,
  payMode: isUat ? 'test' : 'production',
  // Web OAuth client of the Firebase project; the Google ID token is issued for it and the backend checks it.
  googleIosClientId: '204197144339-ja46a381qlvr5n2bk0kr5up5fsg5d8hl.apps.googleusercontent.com',
  googleWebClientId: '204197144339-net2b77rf6d4jndu7nv6r2uj1fmrd1cq.apps.googleusercontent.com',
  api2: baseUrl,
  webUrl: webUrl,
  phoneCode: '+1',
  countryCode: 'US',
  MAPS_API_CALL_KEY: '',
  googleAutoCompleteKey: '',
  emailRegex:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  passwordRegex:
    /^(((?=.*[a-z])(?=.*[A-Z]))((?=.*[a-z]))(?=.*[!@#$%+:^=<(){}[\]~>_?`|'";,.&*€₹£])((?=.*[A-Z])))(?=.{8,})/,
  userNameRegex: /^[a-zA-Z0-9_-]+$/,
  numberRegex: /^[0-9]+$/,
  backAccountRegex: /^[0-9]{9,18}$/,
  urlRegex:
    /(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([\/a-zA-Z0-9#?=&._~-]*)?/,
  endpoints: {
    // User module
    login2: 'client/login',
    loginOUT: 'client/logout',
    personalInfo: 'user/sign-up',
    userInfo: 'client/profile',
    getBills: 'client/bills',
    dashboardList: 'client/dashboard',
    getAllShops: 'client/property',
    getPaymentLink: 'client/bills/initiate-payment/',
    getAdditionalCharges: 'client/additional-charges/',
    getAdditionalChargesPaymentLink:
      'client/additional-charges/initiate-payment/',
    notiList: 'client/notifications',
    socialSignUp: 'user/social-signup',
    verifyOtp: 'user/verify-email',
    resendOtp: 'user/resend-otp',
    forgotPass: 'client/request-password-reset',
    sendOtp: 'client/reset-password',
    resetPass: 'user/reset-password',
    addBasicInfo: 'user/add-basic-info',
    invoiceDownload: 'client/invoice',
    receiptDownload: 'client/receipt',
    invoiceADownload: 'client/additional-charges/invoice/',
    receiptADownload: 'client/additional-charges/receipt/',
    userProfile: 'user/profile',
    followRequest: 'user/follow-user',
    translationList: 'translation/languages',
    translationData: 'translation/language-data',
    readNoti: 'client/notifications',

    // Travel Posts module
    likePost: 'travel-posts/post-like',
    addComment: 'travel-posts/post-comment',
    getPost: 'travel-posts/post-list',
    createPost: 'travel-posts/create-post',
  },
  timeOut: 30000,
  geolocationOptions: {
    enableHighAccuracy: false,
    timeout: 50000,
    maximumAge: 10000,
    distanceFilter: 1,
  },
  geoOptionHighAccurate: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 10000,
    distanceFilter: 1,
  },
};

export default BaseSetting;
