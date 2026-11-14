import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {showNotification} from '@components/NotificationConfig/NotificationHelper';
import {navigationRef, goToTab} from '../../navigation/NavigationService';
import {store} from '@redux/store/configureStore';
import NotificationAction from '@redux/reducers/notification/actions';
import _ from 'lodash';
import authActions from '@redux/reducers/auth/actions';
import {useSelector} from 'react-redux';

const storeFCMToken = async token => {
  const {
    notification: {fcmToken},
  } = store.getState();

  try {
    if (fcmToken.localeCompare(token) != 0) {
      await store.dispatch(NotificationAction.setFcmToken(token));
    }
  } catch (error) {
    console.log('error', error);
  }
};

const handleNotification = remoteMessage => {
  const actionType = remoteMessage?.data?.action;
  // Server-provided deep link (e.g. security deposit notifications carry screen: 'SecurityDeposit').
  const screen = remoteMessage?.data?.screen;
  if (screen) {
    if (['Bills', 'Charges', 'Pay', 'Containers', 'SecurityDeposit', 'Contracts', 'Compliance', 'PropertyDocuments', 'Profile', 'Dashboard'].includes(screen)) {
      goToTab(screen);
    } else {
      navigationRef.current?.navigate(screen);
    }
    return;
  }

  if (actionType == 'my_orders') {
    navigationRef.current?.navigate('MyOrders');
  } else if (actionType === 'sell_car') {
    navigationRef.current?.navigate('SellCar');
  } else {
    goToTab('Dashboard');
  }
};
/**
 *firebase notification
 * @function  RemotePushController
 */

const RemotePushController = () => {
  useEffect(() => {
    PushNotification.configure({
      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        // old app code
        // dispatch({ type: 'onNotificationOpen', payload: notification });

        store.dispatch(NotificationAction.onNotificationOpen(notification));
        if (notification.userInteraction && notification.foreground) {
          handleNotification(notification);
          // notification on click
        }
      },
      popInitialNotification: true,
      requestPermissions: false,
    });
    PushNotification.createChannel(
      {
        channelId: 'default-channel-id', // (required)
        channelName: 'Default channel', // (required)
        channelDescription: 'A default channel', // (optional) default: undefined.
        soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
      },
      created =>
        console.log(`createChannel 'default-channel-id' returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
    );
    messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotification(remoteMessage);
    });
    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNotification(remoteMessage);
        }
      });
    // Get the device token
    messaging()
      .getToken()
      .then(token => {
        console.log('FCM Token', token);
        return storeFCMToken(token);
      });
    // Listen to whether the token changes
    return messaging().onTokenRefresh(token => {
      storeFCMToken(token);
    });
  }, []);
  const {matchData} = useSelector(state => state?.auth);
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Belt and braces: a logged-out device must not surface notifications.
      if (!store.getState().auth.accessToken) {
        return;
      }
      const actionType = remoteMessage?.data?.type;

      const screenName =
        navigationRef?.current &&
        _.isFunction(navigationRef?.current?.getCurrentRoute) &&
        !_.isUndefined(navigationRef?.current?.getCurrentRoute()?.name)
          ? navigationRef?.current?.getCurrentRoute()?.name
          : '';

      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      console.log('actionType=======', actionType);
      showNotification(remoteMessage, true);
      // dispatch({ type: 'updateNotification', payload: remoteMessage });
      store.dispatch(NotificationAction.updateNotification(remoteMessage));
      store.dispatch(NotificationAction.setActionType(actionType));

      if (actionType == 'request_sent') {
        console.log(
          'remoteMessage?.data?.from_user_id=======',
          remoteMessage?.data?.from_user_id,
        );
        store?.dispatch(authActions?.setRequestMatch(true));
        if (remoteMessage?.data?.from_user_id == matchData[0]?.user_id) {
          store?.dispatch(authActions?.setDailyMatch(true));
        }
      }
      if (actionType == 'viewCount_reset') {
        store?.dispatch(authActions?.setDailyMatch(true));
      }
    });
    return unsubscribe;
  }, []);
  return null;
};

export default RemotePushController;
