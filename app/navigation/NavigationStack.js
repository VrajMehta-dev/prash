/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {Appearance} from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import _ from 'lodash';
import NoInternet from '@components/NoInternet';
import {lightColors, darkColors, ToastConfig} from '@config/theme';
import authActions from '@redux/reducers/auth/actions';
import {store} from '@redux/store/configureStore';
import CustomDrawer from './CustomDrawer';
import {navigationRef} from './NavigationService';
import {IOS} from '@utils/commonFunction';

import SplashScreen from '@screens/SplashScreen';
import WalkThrough from '@screens/WalkThrough';
import Login from '@screens/Login';
import OTPVerification from '@screens/OTPVerification';
import PersonalTouch from '@screens/PersonalTouch';
import TermsAndConditions from '@screens/TermsAndConditions';
import PrivacyPolicy from '@screens/PrivacyPolicy';
import FAQs from '@screens/FAQs';
import ContactUs from '@screens/ContactUs';
import About from '@screens/About';
import MyTrips from '@screens/MyTrips';
import SignInScreen from '@screens/Login';
import IntroScreen from '@screens/Intro';
import RegisterScreen from '@screens/Register';
import PoolDetailsScreen from '@screens/PoolDetails';
import ResetEmail from '@screens/ResetEmail';
import ResetCode from '@screens/ResetCode';
import ResetNewPassword from '@screens/ResetNewPassword';
import SignUpMethods from '@screens/SignUpMethods';
import CreatePost from '@screens/CreatePost';
import SettingsScreen from '@screens/Setting';
import UserProfile from '@screens/UserProfile';
import ChatMessage from '@screens/ChatMessage';
import CreateTrip from '@screens/CreateTrip';
import RemotePushController from '@components/NotificationConfig/RemotePushController';
import NotificationScreen from '@screens/Notification';

function App() {
  const Stack = createStackNavigator();
  const toastConfig = ToastConfig();

  const {theme, darkMode} = useSelector(state => state.auth);
  const {languageJson} = useSelector(state => state.language);
  const colorScheme = Appearance.getColorScheme();
  const dispatch = useDispatch();
  const {setDarkMode} = authActions;

  useEffect(() => {
    const {
      auth: {theme},
    } = store.getState();
    if (theme === 'systemDefault') {
      if (colorScheme === 'dark') {
        console.log('💥️ ~ useEffect ~ colorScheme ->', colorScheme);
        dispatch(setDarkMode(true));
      }
    }
  }, [darkMode, dispatch]);

  useEffect(() => {
    const handleColorModeChange = async ({colorScheme}) => {
      const {
        auth: {theme},
      } = store.getState();
      if (theme === 'systemDefault') {
        const isDarkMode = colorScheme === 'dark';
        dispatch(setDarkMode(isDarkMode));
      }
    };

    const subscription = Appearance.addChangeListener(
      _.throttle(handleColorModeChange, IOS ? 150 : 0, {
        leading: false,
        trailing: true,
      }),
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...lightColors,
    },
  };
  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...darkColors,
    },
  };

  const isDarkMode =
    theme === 'systemDefault' ? colorScheme === 'dark' : darkMode;
  const appTheme = lightTheme;

  const navOptions = {headerShown: false};

  return (
    <>
      <NavigationContainer ref={navigationRef} theme={appTheme}>
        <Stack.Navigator
          initialRouteName={'SplashScreen'}
          detachInactiveScreens={IOS}
          screenOptions={{
            animationEnabled: true,
            gestureEnabled: IOS,
          }}>
          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forFadeFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="walkThrough"
            component={WalkThrough}
            options={{
              ...navOptions,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />
          <Stack.Screen
            name="Dashboard"
            component={CustomDrawer}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forScaleFromCenterAndroid,
            }}
          />
          <Stack.Screen
            name="MyTrip"
            component={MyTrips}
            options={{
              ...navOptions,
              cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
            }}
          />
          <Stack.Screen
            name="Login"
            component={SignInScreen}
            options={{
              ...navOptions,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />
          <Stack.Screen
            name="PoolDetails"
            component={PoolDetailsScreen}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forRevealFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="CreatePost"
            component={CreatePost}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forRevealFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="CreateTrip"
            component={CreateTrip}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forRevealFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forRevealFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forRevealFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="TermsAndConditions"
            component={TermsAndConditions}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forRevealFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="UserProfile"
            component={UserProfile}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forRevealFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forFadeFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="ChatMessage"
            component={ChatMessage}
            options={{
              ...navOptions,
              cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
            }}
          />
          <Stack.Screen
            name="SignUpMethods"
            component={SignUpMethods}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forFadeFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="Intro"
            component={IntroScreen}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forScaleFromCenterAndroid,
            }}
          />
          <Stack.Screen
            name="ResetEmail"
            component={ResetEmail}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forHorizontalIOS,
            }}
          />
          <Stack.Screen
            name="ResetCode"
            component={ResetCode}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forHorizontalIOS,
            }}
          />
          <Stack.Screen
            name="ResetNewPassword"
            component={ResetNewPassword}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forHorizontalIOS,
            }}
          />
          <Stack.Screen
            name="OTPVerification"
            component={OTPVerification}
            options={{
              ...navOptions,
              cardStyleInterpolator:
                CardStyleInterpolators.forScaleFromCenterAndroid,
            }}
          />
        </Stack.Navigator>
        <NoInternet />
        <RemotePushController />
      </NavigationContainer>
      <Toast  visibilityTime={2000} autoHide={true} config={toastConfig} />
    </>
  );
}

export default App;
