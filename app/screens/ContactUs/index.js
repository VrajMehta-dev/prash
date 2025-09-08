/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/react-in-jsx-scope */
import {useEffect, useRef, useState} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {Controller, useForm} from 'react-hook-form';
import * as yup from 'yup';
import {useTheme} from '@react-navigation/native';
import {yupResolver} from '@hookform/resolvers/yup';
import {useSelector} from 'react-redux';
import CButton from '@components/CButton';
import CHeader from '@components/CHeader';
import CInput from '@components/CInput';
import AnimatedView from '@components/AnimatedView';
import useKeyboardStatus from '@hooks/useKeyboardStatus';
import BaseSetting from '@config/setting';
import {getApiData} from '@utils/apiHelper';
import {logout} from '@utils/commonFunction';
import {translate} from '@lang/Translate';
import GetStyles from './styles';

const IOS = Platform.OS === 'ios';
const ContactUs = ({navigation, route}) => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;
  const keyboardVisible = useKeyboardStatus();

  // Get data from redux
  const {subscriptionData} = useSelector(state => state.auth);

  const showModal = route?.params?.showModal ? route?.params?.showModal : false;
  const userLoginData = route?.params?.data ? route?.params?.data : {};

  const emailRef = useRef();
  const messageRef = useRef();
  const blockUserModalRef = useRef();
  const subFeatureModalRef = useRef();

  const [btnLoader, setBtnLoader] = useState(false);
  const [showBackButton, setShowBackButton] = useState(true);

  useEffect(() => {
    const backButton = navigation?.canGoBack();
    if (backButton) {
      setShowBackButton(true);
    } else {
      setShowBackButton(false);
    }
  }, []);

  useEffect(() => {
    if (showModal) {
      blockUserModalRef?.current?.open();
    }
  }, []);

  const parentBasicInfoSchema = yup.object().shape({
    email: yup
      .string()
      .required(translate('Email-is-required'))
      .test('no-spaces-email', translate('no-spaces-email'), value => {
        return !/\s/.test(value);
      })
      .matches(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        translate('valid-email-address'),
      ),
    fullName: yup
      .string()
      .required(translate('FullNameRequired'))
      .matches(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/, translate('FullNameCharacters')),
    message: yup.string().required(translate('MessageRequired')),
  });

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(parentBasicInfoSchema),
  });
  async function contactApi(contactData) {
    try {
      setBtnLoader(true);
      const data = {
        full_name: contactData?.fullName,
        message: contactData?.message,
      };
      
      console.log('🚀 ~ App ~ contactApi ~ data->', data);
      const endpoint = BaseSetting.endpoints.contactUs;
      const response = await getApiData(endpoint, 'POST', data);
      console.log('🚀 ~ App ~ contactApi ~ response->', response);
      if (response?.status) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message,
        });
        setBtnLoader(false);
        if (showModal) {
          logout({}, true);
        } else {
          navigation.popToTop();
        }
      } else {
        Toast.show({
          type: 'error',
          text1: translate('error'),
          text2: response?.message,
        });
        setBtnLoader(false);
      }
    } catch (er) {
      console.log('er=======', er);
      setBtnLoader(false);
    }
  }
  return (
    <View style={styles.root}>
      <CHeader
        title={translate('ContactUs')}
        hideBackBtn={!showBackButton}
        onBackPress={() => {
          navigation?.goBack();
        }}
      />
      <KeyboardAvoidingView behavior={IOS ? 'padding' : null} style={{flex: 1}}>
        <AnimatedView>
          <ScrollView
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={[styles.mainContainer]}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                defaultValue={userLoginData.full_name || ''}
                render={({field: {onChange, value}}) => (
                  <CInput
                    required
                    label={translate('fullName')}
                    returnKeyType={'next'}
                    placeholder={translate('fullName')}
                    value={value}
                    onChangeText={onChange}
                    showError={errors?.fullName}
                    errorMsg={errors?.fullName?.message}
                    onSubmitEditing={() => {
                      emailRef?.current?.focus();
                    }}
                  />
                )}
                name="fullName"
              />
              {userLoginData?.register_by == 'phone' ? (
                <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  defaultValue={userLoginData?.phone || ''}
                  name="mobile"
                  render={({field: {onChange, value}}) => (
                    <CInput
                      ref={emailRef}
                      label={translate('mobileNumber')}
                      placeholder={translate('mobileNumber')}
                      value={value}
                      required
                      phoneCode={
                        userLoginData?.phone_code || BaseSetting.phoneCode
                      }
                      countryCode={
                        userLoginData?.phone_country_code ||
                        BaseSetting.countryCode
                      }
                      editable={false}
                      returnKeyType={'next'}
                      autoCapitalize="none"
                      onChangeText={onChange}
                      leftIcon
                      showError={errors?.mobile}
                      errorMsg={errors?.mobile?.message}
                      onSubmitEditing={() => {
                        messageRef?.current?.focus();
                      }}
                    />
                  )}
                />
              ) : (
                <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  defaultValue={userLoginData?.email || ''}
                  render={({field: {onChange, value}}) => (
                    <CInput
                      ref={emailRef}
                      label={translate('email')}
                      placeholder={translate('email')}
                      value={value}
                      required
                      editable={false}
                      keyboardType="email-address"
                      returnKeyType={'next'}
                      autoCapitalize="none"
                      onChangeText={onChange}
                      leftIcon
                      showError={errors?.email}
                      errorMsg={errors?.email?.message}
                      onSubmitEditing={() => {
                        messageRef?.current?.focus();
                      }}
                    />
                  )}
                  name="email"
                />
              )}
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({field: {onChange, value}}) => (
                  <CInput
                    ref={messageRef}
                    label={translate('Message')}
                    placeholder={translate('MessagePlaceHolder')}
                    value={value}
                    required
                    returnKeyType={'done'}
                    multiline
                    autoCapitalize="none"
                    onChangeText={onChange}
                    showError={errors?.message}
                    errorMsg={errors?.message?.message}
                    blurOnSubmit
                    onSubmitEditing={() => {}}
                  />
                )}
                name="message"
              />
            </View>
          </ScrollView>
          {keyboardVisible ? null : (
            <View style={styles.btnstyle}>
              <CButton
                label={translate('Send')}
                onPress={handleSubmit(contactApi)}
                loading={btnLoader}
                disabled={btnLoader}
              />
            </View>
          )}
        </AnimatedView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ContactUs;
