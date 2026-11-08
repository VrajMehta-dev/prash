/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  Image,
  Platform,
  Animated
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import AnimatedView from '@components/AnimatedView';
import CButton from '@components/CButton';
import CDateTimePicker from '@components/CDateTimePicker';
import CInput from '@components/CInput';
import DropDownList from '@components/DropDownList';
import DocumentPicker from 'react-native-document-picker';
import UploadPhotos from '@components/UploadPhotos';
import {FontFamily} from '@config/theme';
import {useRoute} from '@react-navigation/native';
import {getApiDataProgress} from '@utils/apiHelper';
import {IOS} from '@utils/commonFunction';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import BaseSetting from '@config/setting';
import {BlurView} from '@react-native-community/blur';
import Icon, {Icons} from '@config/Icons';
import authActions from '@redux/reducers/auth/actions';

import UploadModal from '@components/UploadPicker';
import {useDispatch} from 'react-redux';
const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

import styles from './styles.js';
import {translate} from '@lang/Translate.js';
const RegisterScreen = ({navigation}) => {
  const route = useRoute();
  const isSocial = route?.params?.isSocial;
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8, 0.7],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });
  const SCREEN_HEIGHT = Dimensions.get('window').height;

  const [showRoleModal, setShowRoleModal] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const {setAccessToken} = authActions;
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    email: '',
    password: '',
    address: '',
    userImage: '',
    birthDate: null,
    // Updated agent-specific fields
    businessName: '',
    hotelName: '',
    hotelId: '',
    businessRegNumber: '',
    governmentCertificate: null,
    guaranteeDocument: null,
  });

  const [errors, setErrors] = useState({});
  const [nextBtnLoader, setNextBtnLoader] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeField, setActiveField] = useState('');

  const handleFileSelect = file => {
    handleChange(activeField, file);
    setFileTypes({
      ...fileTypes,
      [activeField]: file.type,
    });
  };
  const genderOptions = [
    {id: 'male', name: 'Male'},
    {id: 'female', name: 'Female'},
    {id: 'other', name: 'Other'},
  ];

  const handleChange = (name, value) => {
    setForm({...form, [name]: value});
    setErrors({...errors, [name]: null});
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};

    // Common validations remain the same
    if (!form.firstName?.trim())
      newErrors.firstName = translate('simpValidation', {
        field: translate('firstName'),
      });
    if (!form.lastName?.trim())
      newErrors.lastName = translate('simpValidation', {
        field: translate('lastName'),
      });

    if (!form.userImage)
      newErrors.userImage = translate('simpValidation', {
        field: 'Profile photo',
      });

    if (!form.gender)
      newErrors.gender = newErrors.gender = translate('simpValidation', {
        field: translate('gender'),
      });
    if (!form.birthDate) newErrors.birthDate = 'Birth date is required';
    if (!form.address?.trim()) newErrors.address = 'Address is required';

    // Email and password validations remain the same
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!form.password || form.password.length < 8) {
      newErrors.password = translate('passValid1');
    } else if (!/(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])/.test(form.password)) {
      newErrors.password = translate('passValid');
    }

    // Updated agent-specific validations
    if (selectedRole === 'agent') {
      if (!form.businessName?.trim()) {
        newErrors.businessName = translate('simpValidation', {
          field: translate('businessName'),
        });
      }
      if (!form.hotelName?.trim()) {
        newErrors.hotelName = translate('simpValidation', {
          field: translate('hotelName'),
        });
      }
      if (!form.hotelId?.trim()) {
        newErrors.hotelId = translate('simpValidation', {
          field: translate('hotelId'),
        });
      }

      if (!form.businessRegNumber?.trim()) {
        newErrors.businessRegNumber = translate('simpValidation', {
          field: translate('businessRegNumber'),
        });
      }

      if (!form.governmentCertificate) {
        newErrors.governmentCertificate = translate('simpValidation', {
          field: translate('govtCertificate'),
        });
      }
      if (!form.guaranteeDocument) {
        newErrors.guaranteeDocument = translate('simpValidation', {
          field: translate('guaranteeDoc'),
        });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      valid = false;
    }

    return valid;
  };

  const handleSubmit = () => {
    if (validate()) {
      PersonalInfoApi();
    }
  };

  // Add file type state to track file types
  const [fileTypes, setFileTypes] = useState({
    governmentCertificate: '',
    guaranteeDocument: '',
  });
  const previousData = route?.params?.data;
  useEffect(() => {
    const obj = {
      firstName: previousData?.first_name,
      lastName: previousData?.last_name,
      email: previousData?.email,
      userImage: previousData?.picture,
    };
    // setForm({...form, ...obj});
  }, []);
  const clearFields = () => {
    setForm({
      firstName: '',
      lastName: '',
      gender: '',
      age: '',
      email: '',
      password: '',
      address: '',
      userImage: '',
      birthDate: null,
      businessName: '',
      hotelName: '',
      hotelId: '',
      businessRegNumber: '',
      governmentCertificate: null,
      guaranteeDocument: null,
    });
  };
  const PersonalInfoApi = async () => {
    try {
      setNextBtnLoader(true);
      const formData = {
        'SignupForm[first_name]': form.firstName,
        'SignupForm[id]': previousData?.id,
        'SignupForm[last_name]': form.lastName,
        'SignupForm[email]': form.email,
        'SignupForm[birth_date]': form.birthDate,
        'SignupForm[password]': form.password,
        'SignupForm[gender]': form.gender,
        'SignupForm[address]': form.address,
        'SignupForm[profile_photo]': form.userImage,
        'SignupForm[role]': selectedRole,
        'SignupForm[is_social]': isSocial,
      };

      if (selectedRole === 'agent') {
        formData['SignupForm[business_name]'] = form.businessName;
        formData['SignupForm[business_register_number]'] =
          form.businessRegNumber;
        formData['SignupForm[hotel_id]'] = form.hotelId;
        formData['SignupForm[hotel_name]'] = form.hotelName;
        formData['SignupForm[gov_certificate]'] = form.governmentCertificate;
        formData['SignupForm[guarantee_document]'] = form.guaranteeDocument;
      }

      const result = await getApiDataProgress(
        isSocial
          ? BaseSetting.endpoints.addBasicInfo
          : BaseSetting.endpoints.personalInfo,
        'post',
        formData,
      );
      console.log('result', result);

      if (result?.status) {
        dispatch(setAccessToken(result?.data?.access_token));
        clearFields();
        if (isSocial) {
          navigation.reset({
            routes: [{name: 'Dashboard'}],
          });
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: result?.message || '',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'OTP sent to your email.',
          });
          navigation?.navigate('OTPVerification', {email: form.email});
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result?.message,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message,
      });
    } finally {
      setNextBtnLoader(false);
    }
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const RoleSelectionModal = () => (
    <Modal
      visible={showRoleModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowRoleModal(false)}>
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.modalContent}>
          <Text style={styles.modalTitle}>{translate('chooseRole')}</Text>
          <Text style={styles.modalSubtitle}>{translate('selectUsage')}</Text>

          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'user' && styles.selectedRoleCard,
            ]}
            onPress={() => {
              setSelectedRole('user');
              setShowRoleModal(false);
            }}>
            <View style={styles.roleIcon}>
              <Icon type={Icons.FontAwesome6} name={'users'} />
            </View>
            <Text style={styles.roleTitle}>{translate('regularUser')}</Text>
            <Text style={styles.roleDescription}>
              {translate('browseProperties')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'agent' && styles.selectedRoleCard,
            ]}
            onPress={() => {
              setSelectedRole('agent');
              setShowRoleModal(false);
            }}>
            <View style={styles.roleIcon}>
              <Icon type={Icons.MaterialIcons} name={'real-estate-agent'} />
            </View>
            <Text style={styles.roleTitle}>{translate('realEstateAgent')}</Text>
            <Text style={styles.roleDescription}>
              {translate('listProperties')}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
  const RegisterHeader = () => {
    return (
      <Animated.View style={[styles.headerContainer, {height: headerHeight}]}>
        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientContainer}>
          <Animated.View style={[styles.overlay, {opacity: headerOpacity}]} />

          <Animated.View style={[styles.circle1, {opacity: headerOpacity}]} />
          <Animated.View style={[styles.circle2, {opacity: headerOpacity}]} />

          {Platform.OS === 'ios' && (
            <BlurView
              style={styles.blurView}
              blurType="light"
              blurAmount={20}
            />
          )}

          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [{scale: titleScale}, {translateY: titleTranslateY}],
              },
            ]}>
            <Text onPress={() => setShowRoleModal(true)} style={styles.title}>
              {translate('registerText')} as{' '}
              {selectedRole === 'user'
                ? translate('userRole')
                : translate('agentRole')}
            </Text>
            <Animated.Text style={[styles.subtitle, {opacity: headerOpacity}]}>
              {selectedRole === 'user'
                ? translate('browseProperties')
                : translate('listProperties')}
            </Animated.Text>

            <Animated.View
              style={[styles.decorativeLine1, {opacity: headerOpacity}]}
            />
            <Animated.View
              style={[styles.decorativeLine2, {opacity: headerOpacity}]}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView behavior={IOS ? 'padding' : null} style={{flex: 1}}>
        <AnimatedView>
          <RoleSelectionModal />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={{flex: 1}}>
            <RegisterHeader />
            <Animated.ScrollView
              contentContainerStyle={[styles.container]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              scrollEventThrottle={16}
              onScroll={
                selectedRole === 'agent'
                  ? Animated.event(
                      [{nativeEvent: {contentOffset: {y: scrollY}}}],
                      {useNativeDriver: false}, // Use false to support height animations
                    )
                  : undefined
              }>
              <View style={styles.formContainer}>
                <UploadPhotos
                  isSocial={isSocial}
                  data={route?.params?.data?.picture}
                  value={form.userImage}
                  showError={errors.userImage}
                  errorMsg={errors.userImage}
                  onImageChange={val => handleChange('userImage', val)}
                />

                <View style={styles.row}>
                  <View style={styles.inputContainer}>
                    <CInput
                      placeholder={translate('firstName')}
                      value={form.firstName}
                      onChangeText={value => handleChange('firstName', value)}
                      showError={errors.firstName}
                      errorMsg={errors.firstName}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <CInput
                      placeholder={translate('lastName')}
                      value={form.lastName}
                      onChangeText={value => handleChange('lastName', value)}
                      showError={errors.lastName}
                      errorMsg={errors.lastName}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputContainer}>
                    <DropDownList
                      data={genderOptions}
                      value={form.gender}
                      placeholder={translate('selectValue', {
                        valueName: translate('gender'),
                      })}
                      onChange={value => handleChange('gender', value)}
                      showError={errors.gender}
                      errorMsg={errors.gender}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <CDateTimePicker
                      placeholder={translate('birthDate')}
                      value={form.birthDate}
                      labelFormat="date"
                      valueFormat="YYYY-MM-DD"
                      onDateChange={value => handleChange('birthDate', value)}
                      errorMsg={errors.birthDate}
                      showError={errors.birthDate}
                    />
                  </View>
                </View>

                <CInput
                  placeholder={translate('emailLabel')}
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={value => handleChange('email', value)}
                  showError={errors.email}
                  errorMsg={errors.email}
                />

                <CInput
                  placeholder={translate('passwordLabel')}
                  secureTextEntry
                  value={form.password}
                  onChangeText={value => handleChange('password', value)}
                  showError={errors.password}
                  errorMsg={errors.password}
                />

                <CInput
                  placeholder={translate('address')}
                  multiline
                  value={form.address}
                  showError={errors.address}
                  errorMsg={errors.address}
                  onChangeText={value => handleChange('address', value)}
                />

                {selectedRole === 'agent' && (
                  <>
                    <CInput
                      placeholder={translate('businessName')}
                      value={form.businessName}
                      onChangeText={value =>
                        handleChange('businessName', value)
                      }
                      showError={errors.businessName}
                      errorMsg={errors.businessName}
                    />
                    <CInput
                      placeholder={translate('hotelName')}
                      value={form.hotelName}
                      onChangeText={value => handleChange('hotelName', value)}
                      showError={errors.hotelName}
                      errorMsg={errors.hotelName}
                    />

                    <CInput
                      placeholder={translate('hotelId')}
                      value={form.hotelId}
                      onChangeText={value => handleChange('hotelId', value)}
                      showError={errors.hotelId}
                      errorMsg={errors.hotelId}
                    />

                    <CInput
                      placeholder={translate('businessRegNumber')}
                      value={form.businessRegNumber}
                      onChangeText={value =>
                        handleChange('businessRegNumber', value)
                      }
                      showError={errors.businessRegNumber}
                      errorMsg={errors.businessRegNumber}
                    />

                    <>
                      <TouchableOpacity
                        onPress={() => {
                          setActiveField('governmentCertificate');
                          setShowUploadModal(true);
                        }}>
                        <View pointerEvents="none">
                          <CInput
                            placeholder={
                              translate('govtCertificate') +
                              ' ( ' +
                              translate('tapToUpload') +
                              ' ) '
                            }
                            value={form.governmentCertificate?.name || ''}
                            showError={errors.governmentCertificate}
                            errorMsg={errors.governmentCertificate}
                            rightIcon={
                              <Icon
                                type={Icons.FontAwesome}
                                name="upload"
                                size={20}
                                color="#666"
                              />
                            }
                          />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setActiveField('guaranteeDocument');
                          setShowUploadModal(true);
                        }}>
                        <View pointerEvents="none">
                          <CInput
                            placeholder={
                              translate('guaranteeDoc') +
                              ' ( ' +
                              translate('tapToUpload') +
                              ' ) '
                            }
                            value={form.guaranteeDocument?.name || ''}
                            showError={errors.guaranteeDocument}
                            errorMsg={errors.guaranteeDocument}
                            rightIcon={
                              <Icon
                                type={Icons.FontAwesome}
                                name="upload"
                                size={20}
                                color="#666"
                              />
                            }
                          />
                        </View>
                      </TouchableOpacity>
                      <UploadModal
                        visible={showUploadModal}
                        onClose={() => setShowUploadModal(false)}
                        onFileSelect={handleFileSelect}
                        title={translate('uploadDocument')} // optional
                        subtitle={translate('upDoc')} // optional
                      />
                    </>
                  </>
                )}
                <CButton
                  btnStyle={styles.button}
                  label={translate('signUp')}
                  loading={nextBtnLoader}
                  onPress={handleSubmit}
                />
              </View>
            </Animated.ScrollView>
          </KeyboardAvoidingView>
        </AnimatedView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
