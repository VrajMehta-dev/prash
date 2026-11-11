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
      // Status-bar icon must be a white-on-transparent glyph; a coloured launcher icon is drawn as a plain circle.
      // ic_stat_prash ships in every build that can run this JS: prod OTA only reaches builds made after the OTA commit,
      // which already include the drawable. (Was gated on build >= 21, which broke when Play's versionCode restarted at 15.)
      smallIcon: 'ic_stat_prash',
      color: '#721C3F',
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
