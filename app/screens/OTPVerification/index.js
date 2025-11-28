import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import _, {isEmpty} from 'lodash';
import {Controller, useForm} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import COTPInput from '@components/COTPInput';
import CPageLoader from '@components/CPageLoader';
import AnimatedView from '@components/AnimatedView';
import CStatusBar from '@components/CStatusBar';
import {GetTypography} from '@config/theme';
import BaseSetting from '@config/setting';
import authActions from '@redux/reducers/auth/actions';
import momentTZ from 'moment-timezone';
import {getApiData, getApiDataProgress} from '@utils/apiHelper';
import {subscriptionSlugData} from '@utils/commonFunction';
import {translate} from '@lang/Translate';
import GetStyles from './styles';
import debounce from 'lodash.debounce';

import OTPInputView from '@twotalltotems/react-native-otp-input';
import OtpInput from '@components/OTPINPUT';

const OTPVerification = ({navigation, route}) => {
  const styles = GetStyles();
  const Typography = GetTypography();
  const IOS = Platform.OS === 'ios';

  const parentBasicInfoSchema = yup.object().shape({
    otp: yup.string().required('Otp is required.'),
  });

  const {
    control,
    handleSubmit,
    formState: {errors},
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(parentBasicInfoSchema),
  });

  // Reference
  const otpInputRef = useRef();

  // State Variables
  const [loader, setLoader] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isCodeProcessed, setIsCodeProcessed] = useState(false); // State to track code processing

  // Function to handle Resend OTP
  const handleResendOTP = () => {
    forgotPass();
    setOtp('');
    clearErrors('otp');
    setTimer(60);
    // Reset the timer
    setIsCodeProcessed(false); // Reset the code processed state for new OTP
  };

  useEffect(() => {
    if (isForget) {
      forgotPass();
    }
  }, [isForget, forgotPass]);

  // Timer logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const userEmail =
    !_.isEmpty(route?.params?.email) &&
    !_.isNull(route?.params?.email) &&
    !_.isUndefined(route?.params?.email)
      ? route?.params?.email
      : '';

  console.log('userEmail', userEmail);
  const isForget = !_.isUndefined(route?.params?.isForgot)
    ? route?.params?.isForgot
    : false;

  console.log('isForget', isForget);
  useEffect(() => {
    setTimeout(() => {
      startCountDown();
    }, 100);
    return stopCountDown;
  }, []);

  const startCountDown = () => {
    const date = moment().add(1, 'minutes').format();
    otpInputRef?.current?.start(date);
  };

  const stopCountDown = () => {
    otpInputRef?.current?.stop();
  };

  const validation = code => {
    if (!isForget) {
    } else {
      navigation.navigate('ResetPassword', {email: userEmail, otp: code});
      // forgotPass(2, code);
    }
  };

  // //api for forgot password step vise
  // const forgotPass = async (step = 1, code) => {
  //   console.log('step', step);
  //   try {
  //     const data1 = {
  //       'ForgotPasswordForm[email]': userEmail,
  //       'ForgotPasswordForm[step]': step,
  //     };
  //     if (step == 2) {
  //       data1['ForgotPasswordForm[otp]'] = code;
  //     }

  //     const endpoint = BaseSetting.endpoints.forgotPass;
  //     const response = await getApiDataProgress(endpoint, 'post', data1);
  //     console.log('response', response);
  //     if (response?.status) {
  //       if (response?.status && step === 2) {
  //         navigation.navigate('ResetPassword', {email: userEmail});
  //       }
  //       setOtp('');
  //       // Toast.show({
  //       //   type: 'success',
  //       //   text2: 'Registered Succesfully, Please Login',
  //       // });
  //       // navigation.navigate('Login');
  //     } else {
  //       setOtp('');
  //       Toast.show({
  //         type: 'error',
  //         text2: response?.message,
  //       });
  //     }
  //   } catch (error) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: error?.message,
  //     });
  //     setOtp('');
  //   }
  // };
  const forgotPass = useCallback(async () => {
    const url = BaseSetting.baseUrl + BaseSetting.endpoints.forgotPass;
    console.log('Request URL:', url);

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const body = JSON.stringify({email: userEmail});

    try {
      const response = await fetch(url, {method: 'POST', headers, body});

      if (!response) {
        throw new Error('Response is null or undefined.');
      }

      const text = await response.text();
      console.log('Response Text:', text); // Log to see if it's valid

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error('JSON Parsing Error:', jsonError);
        throw new Error('Invalid JSON response from server.');
      }

      console.log('Parsed Response Data:', data);

      if (response.ok && data) {
        Toast.show({type: 'success', text1: 'Great!', text2: 'OTP Sent!'});
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data?.msg || 'Something went wrong!',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching data:', error.message || error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your connection.',
      });
    }
  }, [userEmail, navigation]);

  // // function for resend otp
  // const resendOtpApi = async () => {
  //   try {
  //     const endpoint = `${BaseSetting.endpoints.resendOtp}?email=${userEmail}`;
  //     const response = await getApiData(endpoint, 'get');
  //     setTimer(60);
  //     if (response?.status) {
  //       setOtp('');
  //       clearErrors('otp');
  //       startCountDown();
  //     } else {
  //       setOtp('');
  //       clearErrors('otp');
  //       stopCountDown();
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Error',
  //         text2: response?.message,
  //       });
  //     }
  //   } catch (error) {
  //     setOtp('');
  //     clearErrors('otp');
  //     stopCountDown();
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: error?.message,
  //     });
  //   }
  // };
  // Debounced onCodeFilled handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnCodeFilled = useCallback(
    debounce(code => {
      handleSubmit(validation(code));
    }, 300),
    [isCodeProcessed],
  );

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <KeyboardAvoidingView behavior={IOS ? 'padding' : null} style={{flex: 1}}>
        <AnimatedView>
          <ScrollView
            bounces={false}
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={[styles.mainContainer]}>
              <Text
                style={[Typography.screenHeaderText, {textAlign: 'center'}]}>
                {translate('Otp Verification')}
              </Text>
              <Text
                style={[
                  Typography.screenDescriptionText,
                  {
                    marginVertical: 20,
                    paddingHorizontal: 20,
                    textAlign: 'center',
                  },
                ]}>
                Enter a 6-digit verification code which is sent to your email
              </Text>
              <View style={{alignItems: 'center', marginVertical: 0}}>
                <OtpInput
                  length={6}
                  onComplete={otp => {
                    debouncedOnCodeFilled(otp);
                  }}
                />
              </View>
              <View style={styles.timerContainer}>
                <Text style={{color: 'black'}}>{`00 : ${
                  timer < 10 ? `0${timer}` : timer
                }`}</Text>
                {timer === 0 && (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendText}>
                      {translate('Resend Otp')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {loader ? (
                <CPageLoader style={{position: 'relative'}} size={35} />
              ) : null}
            </View>
          </ScrollView>
        </AnimatedView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OTPVerification;
