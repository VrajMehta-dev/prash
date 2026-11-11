import {Alert, Linking, Platform, Share} from 'react-native';
import Toast from 'react-native-toast-message';
import momentTZ from 'moment-timezone';
import moment from 'moment';
import _ from 'lodash';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import {navigationRef} from '@navigation/NavigationService';
import BaseSetting from '@config/setting';
import {store} from '@redux/store/configureStore';
import AuthAction from '@redux/reducers/auth/actions';
import NotificationAction from '@redux/reducers/notification/actions';
import messaging from '@react-native-firebase/messaging';
import {trackedUrl} from '@utils/openWebsite';

export const IOS = Platform.OS === 'ios';

let loggingOut = false;

// The ONE logout path (button, expired session, API auth errors). Beyond clearing local state it
// (1) tells the server to deactivate this device's push token, (2) deletes the FCM token so Firebase
// itself stops delivering to this install, and (3) clears the stored token so the next login
// registers a fresh one. Skipping any of these is what kept notifications coming after logout.
export const logout = async (userData, hideToast = false, reason = '') => {
  if (loggingOut) {
    return;
  }
  loggingOut = true;
  try {
    const {
      auth: {refreshToken},
      notification: {fcmToken},
    } = store.getState();

    if (fcmToken || refreshToken) {
      // Public endpoint (works with an expired access token). Best effort, capped so logout never hangs.
      await Promise.race([
        global
          .fetch(BaseSetting.baseUrl + BaseSetting.endpoints.loginOUT, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              fcm_token: fcmToken || undefined,
              refresh_token: refreshToken || undefined,
            }),
          })
          .catch(() => {}),
        new Promise(resolve => setTimeout(resolve, 3500)),
      ]);
    }
    try {
      await messaging().deleteToken();
    } catch (e) {}

    store.dispatch(AuthAction.logOut());
    store.dispatch(NotificationAction.clearData());
    store.dispatch(NotificationAction.setFcmToken(''));
    redirectToLogin();
    if (!hideToast) {
      Toast.show({
        type: reason === 'expired' ? 'info' : 'success',
        text1: reason === 'expired' ? 'Session expired' : 'Success',
        text2:
          reason === 'expired'
            ? 'Please sign in again.'
            : 'Logged out successfully.',
      });
    }
    // Fresh token for the next login (deleteToken invalidated the old one).
    messaging()
      .getToken()
      .then(t => store.dispatch(NotificationAction.setFcmToken(t)))
      .catch(() => {});
  } catch (error) {
    console.error('Error signing out:', error);
  } finally {
    loggingOut = false;
  }
};

export const redirectToLogin = () => {
  navigationRef?.current?.reset({
    index: 0,
    routes: [{name: 'Login'}], // was the old travel-template Intro screen (untranslated keys)
  });
};

export function convertDateToFromNow(myDate) {
  const timeZone = momentTZ.tz.guess();
  return moment.tz(myDate, timeZone).calendar(null, {
    sameDay: 'h:mm A',
    lastDay: '[Yesterday]',
    nextWeek: 'dddd',
    lastWeek: 'MMM D, YYYY',
    sameElse: 'MMM D, YYYY',
  });
}

export const formatDate = (
  dateTime,
  type = 'abbreviated_time',
  skipTimeZone = false,
) => {
  const timeZone = momentTZ.tz.guess();
  const momentDate = skipTimeZone
    ? moment.utc(new Date(dateTime))
    : moment.tz(dateTime, timeZone);
  let format = '';

  switch (type) {
    case 'date':
      format = 'MM-DD-YYYY'; // 09-30-2023
      break;
    case 'date_month_only':
      format = 'MM-DD'; // 09-30
      break;
    case 'full_date_time_a':
      format = 'MM-DD-YYYY, h:mm A'; // 09-30-2023 2:42 pm
      break;
    case 'full_date_time':
      format = 'YYYY-MM-DD HH:mm:ss'; // 2023-09-30 2:42:12
      break;
    case 'full_month_date':
      format = 'MMMM D, YYYY'; // September 30, 2023
      break;
    case 'short_date':
      format = 'MMM D, YYYY'; // Sep 30, 2023
      break;
    case 'month_date':
      format = 'MMM D'; // Sep 30
      break;
    case 'abbreviated_time_full':
      format = 'MMM D, YYYY HH:mm'; // Sep 30, 2023 14:42
      break;
    case 'abbreviated_time':
      format = 'MMM D, YYYY h:mm A'; // Sep 30, 2023 2:42 pm
      break;
    case 'time':
      format = 'h:mm A'; // 2:42 pm
      break;
    case 'time_only':
      format = 'HH:mm'; // 14:42
      break;
    case 'quote_time':
      format = 'MMM DD, YYYY | h:mm A'; // 14:42
      break;
    case 'month_year':
      format = 'MMMM YYYY'; // May 2024
      break;
    default:
      format = '';
  }

  if (format) {
    return momentDate.format(format);
  } else {
    return 'Invalid date format.';
  }
};

export const handleNotification = (nData, enableTimeOut = true) => {
  const timeOut = enableTimeOut ? 3500 : 0;
  const actionType = nData?.action;
  const actionData =
    !_.isEmpty(nData?.data) && _.isString(nData?.data)
      ? JSON.parse(nData?.data)
      : {};

  const data =
    !_.isEmpty(actionData) && _.isObject(actionData) ? actionData : {};

  setTimeout(() => {
    if (actionType === 'dashboard') {
      navigationRef.current?.navigate('Dashboard');
    }
  }, timeOut);
};

export const openUrl = async rawUrl => {
  // our own website: tag it so Google Analytics there attributes the visit to the app
  const url = /^https?:\/\/(www\.)?aystera\.com/i.test(rawUrl) ? trackedUrl(rawUrl, 'in_app') : rawUrl;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Toast.show({
        type: 'error',
        text2: 'Something went wrong',
      });
    }
  } catch (error) {
    console.error('An error occurred', error);
    Alert.alert('An error occurred', 'Unable to open Google Maps.');
  }
};

export const onShare = async (message = '', url = '') => {
  try {
    let msg = `${message}`;
    if (Platform.OS == 'android') {
      msg = `${message}\n ${url}`;
    }
    const result = await Share.share({
      message: msg,
      url: url,
    });
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (error) {
    Alert.alert(error.message);
  }
};

export const handleDeepLinking = (
  action = '',
  params = {},
  enableTimeOut = true,
) => {
  const timeOut = enableTimeOut ? 4000 : 0;
  setTimeout(() => {
    if (action == 'dashboard') {
      navigationRef?.current?.navigate('Dashboard');
    }
  }, timeOut);
};

export const isLink = text => {
  const regex = BaseSetting.urlRegex;
  return regex.test(text);
};

// Function to check and request camera permissions
export const checkCameraPermission = async openCamera => {
  let permissionStatus;

  if (Platform.OS === 'android') {
    permissionStatus = await check(PERMISSIONS.ANDROID.CAMERA);
  } else if (Platform.OS === 'ios') {
    permissionStatus = await check(PERMISSIONS.IOS.CAMERA);
  }

  if (permissionStatus === RESULTS.DENIED) {
    // Request the permission
    const requestResult = await request(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA,
    );

    if (requestResult === RESULTS.GRANTED) {
      // Permission granted, open the camera
      openCamera();
      return true;
    } else {
      // Permission denied
      Alert.alert(
        'Camera Permission Denied',
        'Please enable camera access in settings.',
        [
          {text: 'Go to Settings', onPress: () => openSettings()},
          {text: 'Cancel', style: 'cancel'},
        ],
      );
    }
  } else if (permissionStatus === RESULTS.GRANTED) {
    // Permission already granted, open the camera
    openCamera();
    return true;
  } else if (permissionStatus === RESULTS.BLOCKED) {
    // Permission blocked, guide the user to settings
    Alert.alert(
      'Camera Permission Blocked',
      'Please enable camera access in settings.',
      [
        {text: 'Go to Settings', onPress: () => openSettings()},
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  }
};
