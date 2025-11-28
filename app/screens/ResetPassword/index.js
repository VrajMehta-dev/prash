import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';
import BaseSetting from '@config/setting';
import {getApiDataProgress} from '@utils/apiHelper';
import Toast from 'react-native-toast-message';
import {useTheme, useIsFocused} from '@react-navigation/native';
import {translate} from '@lang/Translate';

const {width} = Dimensions.get('window');

const ResetPasswordScreen = ({navigation, route}) => {
  const {colors} = useTheme();
  const BaseColors = colors;
  const isFocused = useIsFocused();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const strengthChecks = {
    hasLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[@$!%*?&]/.test(newPassword),
  };

  const getPasswordStrength = () => {
    const checkedCount = Object.values(strengthChecks).filter(Boolean).length;
    if (checkedCount === 5) return {label: 'Strong', color: '#2ecc71'};
    if (checkedCount >= 3) return {label: 'Medium', color: '#f1c40f'};
    return {label: 'Weak', color: '#e74c3c'};
  };

  const validatePassword = password => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleResetPassword = () => {
    let isValid = true;
    const newErrors = {
      newPassword: '',
      confirmPassword: '',
    };

    if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Please meet all password requirements';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      forgotPass(newPassword);
      console.log('Password reset successful');
    }
  };

  const passwordStrength = getPasswordStrength();

  const RequirementIcon = ({isValid}) => (
    <Icon
      name={isValid ? 'check-circle' : 'radio-button-unchecked'}
      size={20}
      color={isValid ? '#2ecc71' : '#666'}
    />
  );
  const forgotPass = async newPass => {
    const url = BaseSetting.baseUrl + BaseSetting.endpoints.sendOtp;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const body = JSON.stringify({
      email: route?.params?.email,
      otp: route?.params?.otp,
      password: newPass,
    });

    try {
      setLoader(true);
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('Raw Response:', response);

      // ✅ Handle empty response case
      const text = await response.text(); // Read response as text
      const data = text ? JSON.parse(text) : {}; // Parse if not empty

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Great!',
          text2: 'Password Changed Successfully',
        });
        navigation.reset({
          routes: [{name: 'Login'}],
        });
      } else {
        navigation.reset({
          routes: [{name: 'ForgotPassword'}],
        });
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'OTP has been expired please try again!',
        });
      }

      console.log('Response Data:', data);
      setLoader(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your connection.',
      });
      setLoader(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
      {isFocused && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#fff"
          showHideTransition="slide"
        />
      )}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Icon name="lock-reset" size={80} color={'#632240'} />
            <Text style={styles.title}>{translate('Reset Password')}</Text>
            <Text style={styles.subtitle}>
              Create a strong password for your account
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {newPassword.length > 0 && (
              <View style={styles.strengthIndicator}>
                <View style={styles.strengthBar}>
                  <Animated.View
                    style={[
                      styles.strengthFill,
                      {
                        backgroundColor: passwordStrength.color,
                        width: `${
                          (Object.values(strengthChecks).filter(Boolean)
                            .length /
                            5) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    {color: passwordStrength.color},
                  ]}>
                  Password Strength: {passwordStrength.label}
                </Text>
              </View>
            )}

            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>
                <Icon name="info" size={16} color="#666" /> Password
                Requirements
              </Text>
              {Object.entries(strengthChecks).map(([key, isValid]) => (
                <View key={key} style={styles.requirementRow}>
                  <RequirementIcon isValid={isValid} />
                  <Text
                    style={[
                      styles.requirementText,
                      isValid && styles.validRequirement,
                    ]}>
                    {key === 'hasLength' && '8+ characters'}
                    {key === 'hasUpperCase' && 'Uppercase letter'}
                    {key === 'hasLowerCase' && 'Lowercase letter'}
                    {key === 'hasNumber' && 'Number'}
                    {key === 'hasSpecialChar' && 'Special character'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {errors.confirmPassword ? (
              <Text style={styles.errorText}>
                <Icon name="error" size={14} color="#e74c3c" />{' '}
                {errors.confirmPassword}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                !validatePassword(newPassword) && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={!validatePassword(newPassword)}>
              {loader ? (
                <ActivityIndicator color={BaseColors.secondary} />
              ) : (
                <View style={{flexDirection: 'row'}}>
                  <Icon
                    name="lock-reset"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Reset Password</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
