/* eslint-disable react-hooks/rules-of-hooks */
import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import moment from 'moment';
import {store} from '@redux/store/configureStore';

/**
 *
 *@function showNotification
 *
 */
export const showNotification = (remoteMessage, isForeground = false) => {
  const {data, notification, sentTime} = remoteMessage;
  if (
    !remoteMessage.hasOwnProperty('notification') /*notification === undefined*/
  ) {
    // For Handling Comet Chat Notifications
    const {title, alert, message} = data;
    let notificationTitle = title;
    if (message) {
      sendLocalNotification(notificationTitle, alert, message);
    }
  } else {
    //Receiving Notification from our server in foreground
    const {body, title} = notification;
    if (isForeground && store.getState().auth.activeScreen !== 'Chat') {
      sendLocalNotification(title, body, data, sentTime);
    } else {
      console.log('You are in the Chat screen No Notification');
    }
  }
};

const sendLocalNotification = (title, body, data, time) => {
  if (Platform.OS === 'android') {
    PushNotification.localNotification({
      channelId: 'default-channel-id',
      largeIcon: 'ic_launcher', // (optional) default: "ic_launcher"
      smallIcon: 'ic_launcher_round', // (optional) default: "ic_notification" with fallback for "ic_launcher"
      title: title,
      message: body,
      bigPictureUrl: data?.imageUrl || '',
      when: time || moment().unix(),
      userInfo: data,
      // tag: tag,
    });
  } else {
    let details = {
      alertTitle: title,
      alertBody: body,
      userInfo: data,
    };

    console.log('PushNotificationIOS ===', PushNotificationIOS);

    PushNotificationIOS.presentLocalNotification(details);
  }
};
