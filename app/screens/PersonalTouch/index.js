/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react-native/no-inline-styles */
import {useEffect, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
} from 'react-native';
import Toast from 'react-native-toast-message';
import _ from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {Controller, useForm} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {PhoneNumberUtil} from 'google-libphonenumber';
import {useIsFocused, useTheme} from '@react-navigation/native';
import CInput from '@components/CInput';
import CButton from '@components/CButton';
import CModal from '@components/CModal';
import CRadio from '@components/CRadio';
import CHeader from '@components/CHeader';
import AnimatedView from '@components/AnimatedView';
import DropDownList from '@components/DropDownList';
import CPageLoader from '@components/CPageLoader';
import useKeyboardStatus from '@hooks/useKeyboardStatus';
import {hereAboutUsData} from '@config/staticData';
import BaseSetting from '@config/setting';
import {translate} from '@lang/Translate';
import authActions from '@redux/reducers/auth/actions';
import {checkHours, formatDate} from '@utils/commonFunction';
import GetStyles from './styles';

const IOS = Platform.OS === 'ios';
const PersonalTouch = ({navigation, route}) => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;
  const keyboardVisible = useKeyboardStatus();

  // Params
  const phoneCountryCode = route?.params?.phoneCountryCode;
  const editProfile = route?.params?.editProfile
    ? route?.params?.editProfile
    : false;

  // set data in redux
  const dispatch = useDispatch();
  const {setLastScreen, setHearAboutUs, setUserData} = authActions;

  // Get data from redux
  const {userData, hearAboutUs} = useSelector(state => state.auth);

  // References
  const userNameRef = useRef();
  const fullNameRef = useRef();
  const mobileNumberRef = useRef();
  const emailRef = useRef();
  const countryRef = useRef();

  const [phoneCode, setPhoneCode] = useState(BaseSetting.phoneCode);
  const [countryCode, setCountryCode] = useState(BaseSetting.countryCode);
  const [userImage, setUserImage] = useState('');
  const [btnLoader, setBtnLoader] = useState(false);
  const [showBackButton, setShowBackButton] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [countryListLoader, setCountryListLoader] = useState(false);
  const [country, setCountry] = useState([]);

  const isPhoneEnabled = userData?.register_by !== 'phone';
  const isEmailEnabled =
    userData?.register_by !== 'email' && userData?.register_by !== 'google';

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      const backButton = navigation.canGoBack();
      if (backButton) {
        setShowBackButton(true);
      } else {
        setShowBackButton(false);
      }
    }
  }, [isFocused]);

  function validation(data) {
    if (_.isEmpty(userImage)) {
      Toast.show({
        type: 'error',
        text2: 'Profile picture is required.',
      });
    } else {
      if (hearAboutUs && !editProfile) {
        setModalVisible(true);
      } else {
      }
    }
  }

  // validation for phone number
  const validatePhoneNumber = (value, countryCode) => {
    const phoneUtil = PhoneNumberUtil.getInstance();
    try {
      const parsedNumber = phoneUtil.parseAndKeepRawInput(value, countryCode);
      const isValidPhoneNumber = phoneUtil.isValidNumber(parsedNumber);
      return isValidPhoneNumber;
    } catch (error) {
      return false;
    }
  };

  // validation for personal detail
  const parentBasicInfoSchema = (
    countryCode,
    isPhoneEnabled,
    isEmailEnabled,
  ) => {
    return yup.object().shape({
      userName: yup
        .string()
        .trim()
        .required(translate('userNameRequired'))
        .min(3, translate('userNameMinCharError'))
        .max(25, translate('userNameMaxCharError'))
        .test('no-spaces-username', translate('no-spaces-username'), value => {
          return !/\s/.test(value);
        })
        .matches(/^[a-zA-Z0-9._]+$/, translate('Invalid-username'))
        .test(
          'is-valid-username',
          translate('Invalid-username'),
          value => !/(?:[._]){2}|^\.|\.$|^_|_$|\s|[^a-zA-Z0-9._]/.test(value),
        ),
      fullName: yup
        .string()
        .trim()
        .required(translate('FullNameRequired'))
        .matches(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/, translate('FullNameCharacters')),
      phone: isPhoneEnabled
        ? yup
            .string()
            .required(translate('Mobile-number-required'))
            .test('no-spaces-mobile', translate('no-spaces-mobile'), value => {
              return !/\s/.test(value);
            })
            .matches(/^\d+$/, translate('Mobile-number-required'))
            .test('is-valid-mobile', translate('is-valid-mobile'), value =>
              validatePhoneNumber(value, countryCode),
            )
        : yup.string(),
      email: isEmailEnabled
        ? yup
            .string()
            .required(translate('Email-is-required'))
            .test('no-spaces-email', translate('no-spaces-email'), value => {
              return !/\s/.test(value);
            })
            .matches(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              translate('valid-email-address'),
            )
        : yup.string(),
      city: yup.string().required(translate('CityError')),
      country: yup.string().required(translate('CountryError')),
    });
  };

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
    getValues,
    reset,
    clearErrors,
    setFocus,
    register,
    trigger,
    setError,
  } = useForm({
    resolver: yupResolver(
      parentBasicInfoSchema(countryCode, isPhoneEnabled, isEmailEnabled),
    ),
  });

  const submitData = item => {};

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={IOS ? 'padding' : null} style={{flex: 1}}>
        <CHeader
          onBackPress={() => {
            navigation?.goBack();
          }}
          hideBackBtn={showBackButton ? false : true}
          progressBar={editProfile ? false : true}
          title={editProfile ? translate('EditPersonalDetails') : false}
          progressBarValue={75}
          mainContainerStyle={{height: 90}}
        />
        {pageLoader ? (
          <CPageLoader />
        ) : (
          <AnimatedView>
            <ScrollView
              contentContainerStyle={{flexGrow: 1}}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={[styles.mainContainer]}>
                <Text style={styles.title}>{translate('addPersonal')}</Text>
                <Text style={styles.description}>
                  {translate('addPersonalDescription')}
                </Text>
                <View>
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    defaultValue={userData.user_name}
                    render={({field: {onChange, value}}) => (
                      <CInput
                        ref={userNameRef}
                        label={translate('Username')}
                        infoIcon
                        returnKeyType={'next'}
                        required
                        placeholder={translate('Username')}
                        value={value}
                        autoCapitalize="none"
                        onChangeText={onChange}
                        showError={errors?.userName}
                        errorMsg={errors?.userName?.message}
                        infoLabel={
                          <View style={{padding: 5}}>
                            <Text style={styles.infoText}>
                              {'\u2022'} {translate('uniqueUsername')}
                            </Text>
                            <Text style={styles.infoText}>
                              {'\u2022'} {translate('charactersUsername')}
                            </Text>
                            <Text style={styles.infoText}>
                              {'\u2022'} {translate('peopleSearch')}
                            </Text>
                          </View>
                        }
                        onSubmitEditing={() => {
                          fullNameRef?.current?.focus();
                        }}
                      />
                    )}
                    name="userName"
                  />
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    defaultValue={userData?.full_name || ''}
                    render={({field: {onChange, value}}) => (
                      <CInput
                        required
                        ref={fullNameRef}
                        label={translate('fullName')}
                        returnKeyType={'next'}
                        autoCapitalize={'words'}
                        placeholder={translate('fullName')}
                        value={value}
                        onChangeText={onChange}
                        showError={errors?.fullName}
                        errorMsg={errors?.fullName?.message}
                        onSubmitEditing={() => {
                          isPhoneEnabled
                            ? mobileNumberRef?.current?.focus()
                            : emailRef?.current?.focus();
                        }}
                      />
                    )}
                    name="fullName"
                  />
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    disabled={userData?.register_by == 'phone'}
                    defaultValue={userData?.phone || ''}
                    render={({field: {onChange, value}}) => (
                      <CInput
                        ref={mobileNumberRef}
                        required
                        label={translate('mobileNumber').replace(/\b\w/g, c =>
                          c.toUpperCase(),
                        )}
                        placeholder="000 000 0000"
                        phoneInput
                        maxLength={15}
                        editable={userData?.register_by != 'phone'}
                        value={value}
                        keyboardType="number-pad"
                        onChangeText={onChange}
                        returnKeyType={'next'}
                        onCountrySelect={(phone_code, Country_code) => {
                          setPhoneCode(phone_code);
                          setCountryCode(Country_code);
                        }}
                        phoneCode={phoneCode}
                        countryCode={countryCode}
                        showError={errors?.phone}
                        errorMsg={errors?.phone?.message}
                        onSubmitEditing={() => {
                          if (isEmailEnabled) {
                            emailRef?.current?.focus();
                          } else {
                            fullNameRef?.current?.blur();
                            countryRef?.current?.open();
                          }
                        }}
                      />
                    )}
                    name="phone"
                  />
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    defaultValue={userData?.email || ''}
                    disabled={userData?.register_by == 'email'}
                    render={({field: {onChange, value}}) => (
                      <CInput
                        ref={emailRef}
                        label={translate('email')}
                        placeholder={translate('email')}
                        editable={
                          userData?.register_by !== 'email' &&
                          userData?.register_by !== 'google'
                        }
                        keyboardType="email-address"
                        value={value}
                        required
                        returnKeyType={'next'}
                        autoCapitalize="none"
                        onChangeText={onChange}
                        leftIcon
                        showError={errors?.email}
                        errorMsg={errors?.email?.message}
                        onSubmitEditing={() => {
                          emailRef?.current?.blur();
                          countryRef?.current?.open();
                        }}
                      />
                    )}
                    name="email"
                  />
                  <Controller
                    control={control}
                    name="country"
                    rules={{
                      required: true,
                    }}
                    render={({field: {onChange, value}}) => (
                      <DropDownList
                        required
                        disabled={
                          !_.isNull(userData?.city_updated_at) &&
                          !checkHours(
                            formatDate(
                              userData?.city_updated_at,
                              'full_date_time',
                            ),
                          )
                        }
                        label={translate('Country')}
                        placeholder={translate('countryPlaceholder')}
                        loading={countryListLoader}
                        data={country}
                        ref={countryRef}
                        valueProp="iso2"
                        objectData
                        isSearch
                        onChange={onChange}
                        value={value}
                        showError={errors?.country}
                        errorMsg={errors?.country?.message}
                        dropdownPosition={
                          IOS ? (keyboardVisible ? 'auto' : 'top') : 'auto'
                        }
                      />
                    )}
                  />
                </View>
                <CButton
                  label={
                    editProfile
                      ? translate('save&Continue')
                      : translate('Continue')
                  }
                  loading={btnLoader}
                  disabled={btnLoader}
                  onPress={handleSubmit(validation)}
                  btnStyle={{marginVertical: 20}}
                />
              </View>
            </ScrollView>
          </AnimatedView>
        )}
      </KeyboardAvoidingView>
      <CModal
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
        backHandleDisable={btnLoader}
        title={translate('hearAboutUs')}>
        <View
          style={{
            padding: 20,
            justifyContent: 'space-between',
          }}>
          <Controller
            control={control}
            name="hearAboutUs"
            defaultValue={hereAboutUsData[0]}
            render={({field: {onChange, value}}) => (
              <CRadio
                style={{
                  justifyContent: 'space-between',
                }}
                singleStyle={{marginLeft: 0}}
                options={hereAboutUsData}
                selectedOption={value}
                handleOptionSelect={onChange}
              />
            )}
          />
          <View
            style={{
              alignItems: 'center',
              paddingBottom: IOS ? 10 : 0,
              marginTop: 20,
            }}>
            <CButton
              loading={btnLoader}
              disabled={btnLoader}
              label={translate('submit&Continue')}
              onPress={handleSubmit(submitData)}
            />
          </View>
        </View>
      </CModal>
    </View>
  );
};

export default PersonalTouch;
