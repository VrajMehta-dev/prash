/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import BaseSetting from '@config/setting';
import {useDispatch, useSelector} from 'react-redux';
import authActions from '@redux/reducers/auth/actions';
import {store} from '@redux/store/configureStore';
import DeviceInfo from 'react-native-device-info';
import {useFocusEffect} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isFocused, setIsFocused] = useState({email: false, password: false});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [shadowActive, setShadowActive] = useState(false);
  const {setUserData, setAccessToken, setShopSelected} = authActions;
  const scrollViewRef = useRef(null);

  const {userData, shopSelected, accessToken} = useSelector(
    state => state.auth,
  );
  console.log('🚀 ~ Login ~ accessToken:', accessToken);
  console.log('🚀 ~ Login ~ shopSelected:', shopSelected);
  // Professional animation values
  const fadeIn = useMemo(() => new Animated.Value(0), []);
  const slideUp = useMemo(() => new Animated.Value(30), []);
  const formFade = useMemo(() => new Animated.Value(0), []);
  const elevationAnim = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    // Elegant fade and slide animations
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(formFade, {
        toValue: 1,
        duration: 1200,
        delay: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    // Smooth elevation animation using JS driver (since shadowOffset can't use native driver)
    setTimeout(() => {
      Animated.timing(elevationAnim, {
        toValue: 1,
        duration: 500, // Slower transition for smoother effect
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false, // Use JS driver for shadow properties
      }).start(() => {
        // Once animation is complete, set the final shadow state
        setShadowActive(true);
      });
    }, 2000);

    // Fallback timeout to ensure animations complete
    const fallbackTimer = setTimeout(() => {
      setShadowActive(true);
    }, 3000);

    // Keyboard listeners to adjust UI
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Avoid force-scrolling to end on Android which can leave a bottom gap after hide
        // scrollViewRef.current?.scrollToEnd({animated: true});
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      clearTimeout(fallbackTimer);
    };
  }, [elevationAnim, fadeIn, formFade, slideUp]);

  const dispatch = useDispatch();
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = password => {
    return password.length >= 6;
  };
  const {fcmToken} = useSelector(state => state.notification);

  const [deviceInfo, setDeviceInfo] = React.useState({});
  useFocusEffect(
    useCallback(() => {
      console.log('Screen is focused');
      dispatch(setShopSelected({}));

      // Fetch or refresh data here
      return () => {
        console.log('Screen is unfocused');
        // Cleanup if needed
      };
    }, []),
  );
  React.useEffect(() => {
    const getDeviceInfo = async () => {
      const device_id = await DeviceInfo.getDeviceId();
      const brand = DeviceInfo.getBrand();
      const model = await DeviceInfo.getModel();
      const os = DeviceInfo.getSystemName();
      const os_version = DeviceInfo.getSystemVersion();
      const app_version = await DeviceInfo.getVersion();
      const build_number = await DeviceInfo.getBuildNumber();
      const unique_id = await DeviceInfo.getUniqueId();
      const manufacturer = await DeviceInfo.getManufacturer();
      const is_emulator = await DeviceInfo.isEmulator();

      setDeviceInfo({
        device_id,
        brand,
        model,
        os,
        os_version,
        app_version,
        build_number,
        unique_id,
        manufacturer,
        is_emulator,
      });
    };

    getDeviceInfo();
  }, []);
  const fetchData = async () => {
    try {
      setLoader(true);
      const url = BaseSetting.baseUrl + BaseSetting.endpoints.login2;
      console.log('URL:', url);

      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const body = JSON.stringify({
        email: email?.toLowerCase(),
        password: password,
        fcm_token: fcmToken,
        device_info: deviceInfo,
      });
      console.log('body', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('Raw Response:', response);

      // ✅ Handle empty response case
      const text = await response.text(); // Read response as text
      const data = text ? JSON.parse(text) : {}; // Parse if not empty
      console.log('data==>12', data);

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Great!',
          text2: data.msg || 'Login successful!',
        });
        console.log('data?.accessToken==>', data?.accessToken);
        dispatch(setAccessToken(data?.accessToken));
        navigation.reset({
          routes: [{name: 'Dashboard'}],
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data?.msg || 'Something went wrong!',
        });
        if (data?.msg === 'Email not verified. Please reset your password.') {
          navigation.replace('OTPVerification', {email: email, isForgot: true});
        }
      }

      console.log('Response Data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your connection.',
      });
    } finally {
      setLoader(false);
    }
  };

  const handleLogin = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Dismiss keyboard before login
    Keyboard.dismiss();
    fetchData();
  };

  // Handle input focus to scroll to the right position
  const handleInputFocus = field => {
    setIsFocused({...isFocused, [field]: true});
    // Allow animation to complete before scrolling
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  // Get the dynamic styles for card shadow
  const getCardShadowStyle = () => {
    if (Platform.OS === 'ios') {
      return {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: elevationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.25],
        }),
        shadowRadius: elevationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 3.84],
        }),
      };
    } else {
      // For Android
      return {
        elevation: elevationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 5],
        }),
      };
    }
  };

  // Add a loading state to prevent blank screen
  if (!fadeIn || !slideUp || !formFade || !elevationAnim) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color="#632240" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gradient} />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeIn,
                transform: [{translateY: slideUp}],
                height: keyboardVisible ? 100 : 'auto',
                marginTop: keyboardVisible ? 20 : height * 0.08,
              },
            ]}>
            {!keyboardVisible ? (
              <>
                <View style={styles.logoContainer}>
                  <IconFA name="concierge-bell" size={40} color="#fff" />
                </View>
                <Text style={styles.title}>Prayashmay</Text>
                <Text style={styles.subtitle}>Hospitality Private Limited</Text>
              </>
            ) : (
              <Text style={styles.compactTitle}>Prayashmay Hospitality</Text>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: formFade,
              },
            ]}>
            <Animated.View style={[styles.card, getCardShadowStyle()]}>
              <Text style={styles.welcomeText}>Welcome Back</Text>

              <View
                style={[
                  styles.inputContainer,
                  isFocused.email && styles.inputFocused,
                  errors.email && styles.inputError,
                ]}>
                <Icon
                  name="email"
                  size={24}
                  color={isFocused.email ? '#632240' : '#666'}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setErrors({...errors, email: ''});
                  }}
                  onFocus={() => handleInputFocus('email')}
                  onBlur={() => setIsFocused({...isFocused, email: false})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <View
                style={[
                  styles.inputContainer,
                  isFocused.password && styles.inputFocused,
                  errors.password && styles.inputError,
                ]}>
                <Icon
                  name="lock"
                  size={24}
                  color={isFocused.password ? '#632240' : '#666'}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    setErrors({...errors, password: ''});
                  }}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={() => setIsFocused({...isFocused, password: false})}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}>
                  <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('ForgotPassword', {email: email});
                }}
                style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  shadowActive && Platform.OS === 'android'
                    ? {elevation: 5}
                    : null,
                  shadowActive && Platform.OS === 'ios'
                    ? {
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                      }
                    : null,
                ]}
                onPress={handleLogin}
                activeOpacity={0.9}>
                {loader ? (
                  <ActivityIndicator color={'#fff'} />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Extra padding at bottom to ensure form is visible when keyboard is open */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#632240',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  compactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputFocused: {
    borderColor: '#632240',
    backgroundColor: '#fff',
    elevation: 2,
  },
  inputError: {
    borderColor: '#ff3333',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: '#ff3333',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#632240',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#632240',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Login;
