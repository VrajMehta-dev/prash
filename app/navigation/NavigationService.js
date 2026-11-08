import * as React from 'react';

// NavigationConatiner is refered here - Check NavigationStack
export const navigationRef = React.createRef();

function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

function goBack() {
  navigationRef.current?.goBack();
}

// Open a screen of the main tab navigator from anywhere (a pushed stack screen such as Notifications,
// a push-notification tap, ...). Plain navigate('Bills') from a stack screen would switch the tab
// underneath but leave the stack screen on top.
export function goToTab(name, params) {
  navigationRef.current?.navigate('Dashboard', {screen: name, params});
}

export default {
  navigate,
  goBack,
  goToTab,
};
