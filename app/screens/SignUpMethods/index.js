// index.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import {styles} from './styles';
import {
  AppleButton,
  appleAuth,
} from '@invertase/react-native-apple-authentication';
import Toast from 'react-native-toast-message';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import authActions from '@redux/reducers/auth/actions';
import {useDispatch} from 'react-redux';
import BaseSetting from '@config/setting';
import {getApiDataProgress} from '@utils/apiHelper';
import _ from 'lodash';
import {translate} from '@lang/Translate';

const SignUpMethods = ({navigation}) => {
  const dispatch = useDispatch();
  const {setAccessToken} = authActions;
  const [googleLoader, setGoogleLoader] = useState(false);
  const [appleLoader, setAppleLoader] = useState(false);

  // Icon URLs
  const icons = {
    email: 'https://img.icons8.com/ios/50/000000/mail.png',
    google: 'https://img.icons8.com/color/48/000000/google-logo.png',
    apple: 'https://img.icons8.com/m_outlined/512/FFFFFF/mac-os--v2.png',
  };

  GoogleSignin.configure({
    webClientId:
      '478218184444-oglhlk1bv2m3abjg5op89f9ca4nqpduh.apps.googleusercontent.com', // Web Client ID
    iosClientId:
      '478218184444-0ahm36ath7oq8jt5ob4ghs77obh182h2.apps.googleusercontent.com', // iOS Client ID
    offlineAccess: true, // For server-side access
    forceConsentPrompt: true, // To show consent screen every time
  });
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('Signin userDAta ======>>>>>', userInfo);
      socialLogin('google', userInfo?.data.idToken);
    } catch (error) {
      console.log('Message', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services Not Available or Outdated');
      } else {
        console.log('Some Other Error Happened');
      }
    }
  };
  const handleAppleSignIn = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const {user, email, fullName, identityToken} = appleAuthRequestResponse;

      console.log('Apple Sign-In Success:', {
        user,
        email,
        fullName,
        identityToken,
      });
      const displayName = _.isEmpty(fullName.givenName)
        ? 'User'
        : fullName?.givenName + ' ' + fullName?.familyName;

      socialLogin('apple', identityToken, displayName);
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      // Handle specific error codes
      switch (error.code) {
        case appleAuth.Error.CANCELED:
          Toast.show({
            type: 'info',
            text1: 'Sign-In Canceled',
            text2: 'You canceled the sign-in process.',
          });
          break;

        case appleAuth.Error.FAILED:
          Toast.show({
            type: 'error',
            text1: 'Sign-up Failed',
            text2: 'Sign-up with Apple failed. Please try again.',
          });
          break;

        case appleAuth.Error.INVALID_RESPONSE:
          Toast.show({
            type: 'error',
            text1: 'Invalid Response',
            text2: 'Received an invalid response from Apple. Please try again.',
          });
          break;

        case appleAuth.Error.NOT_HANDLED:
          Toast.show({
            type: 'error',
            text1: 'Sign-up Not Handled',
            text2: 'The sign-up request was not handled. Please try again.',
          });
          break;

        case appleAuth.Error.UNKNOWN:
          Toast.show({
            type: 'error',
            text1: 'Unknown Error',
            text2: 'An unknown error occurred during Apple Sign-Up.',
          });
          break;

        default:
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'An unexpected error occurred. Please try again.',
          });
      }
    }
  };
  // Function to handle the "Next" button press and make an API call
  const socialLogin = async (type, token, name) => {
    console.log('name', name);
    console.log('token', token);
    console.log('type', type);

    try {
      const data = {
        'SocialForm[social_type]': type == 'google' ? 1 : 2,
        'SocialForm[token]': token,
      };
      if (type == 'apple') {
        data['SocialForm[name]'] = name;
      }

      const endpoint = BaseSetting.endpoints.socialSignUp;
      const result = await getApiDataProgress(endpoint, 'post', data);
      console.log('result', result);
      if (result?.status) {
        if (result?.data?.isProfileComplete) {
          dispatch(setAccessToken(result?.data?.access_token));
          navigation.reset({
            routes: [{name: 'Dashboard'}],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [
              {name: 'Register', params: {data: result?.data, isSocial: true}},
            ],
          });
        }
        Toast.show({
          type: 'success',
          text1: 'Great!',
          text2: result?.message,
        });

        // setNextSocialLoader(false);
      } else {
        // API call failed, display an error message
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result?.message,
        });
        // setNextSocialLoader(false);
      }
    } catch (error) {
      // Handle API call error
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message,
      });
      // setNextSocialLoader(false);
    }
  };
  // Button Component for reusability
  const SignUpButton = ({icon, title, onPress, buttonStyle, textStyle}) => (
    <TouchableOpacity
      style={[styles.signUpButton, buttonStyle]}
      onPress={onPress}>
      <Image source={{uri: icon}} style={styles.buttonIcon} />
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>{translate('welcomeText')}</Text>
        <Text style={styles.subtitleText}>{translate('chooseJoinMethod')}</Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        {/* Email Sign Up */}
        <SignUpButton
          icon={icons.email}
          title={translate('continueWithProvider', {serviceProvider: 'Email'})}
          onPress={() => navigation.navigate('Register')}
        />

        {/* Google Sign Up */}
        <SignUpButton
          icon={icons.google}
          title={translate('continueWithProvider', {serviceProvider: 'Google'})}
          onPress={() => {
            signIn();
          }}
          buttonStyle={styles.googleButton}
        />

        {/* Apple Sign Up */}
        <SignUpButton
          icon={icons.apple}
          title={translate('continueWithProvider', {serviceProvider: 'Apple'})}
          onPress={() => {
            handleAppleSignIn();
          }}
          buttonStyle={styles.appleButton}
          textStyle={styles.appleButtonText}
        />
      </View>
      {/* Terms and Conditions */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          {translate('termsAgreement')}
          <Text
            onPress={() => {
              navigation.navigate('TermsAndConditions');
            }}
            style={styles.linkText}>
            {translate('termsAndConditions')}
          </Text>{' '}
          {translate('andKey')}{' '}
          <Text style={styles.linkText}>{translate('privacyPolicy')}</Text>
        </Text>
      </View>
      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>
          {' '}
          {translate('alreadyHaveAccount') + ' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>{translate('logIn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignUpMethods;
