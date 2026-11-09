/* eslint-disable react-native/no-inline-styles */
import BrandWordmark from '@components/BrandWordmark';
import {Brand} from '@config/brand';
import LinearGradient from 'react-native-linear-gradient';
import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
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
  ActivityIndicator
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import BaseSetting from '@config/setting';
import {IS_UAT} from '@config/env';
import {useDispatch, useSelector} from 'react-redux';
import authActions from '@redux/reducers/auth/actions';
import {store} from '@redux/store/configureStore';
import DeviceInfo from 'react-native-device-info';
import {useFocusEffect} from '@react-navigation/native';

// Loaded defensively: a build without the native module just hides the Google button instead of crashing.
let GoogleSignin = null;
let googleStatus = {};
try {
  const g = require('@react-native-google-signin/google-signin');
  GoogleSignin = g.GoogleSignin;
  googleStatus = g.statusCodes || {};
  GoogleSignin.configure({webClientId: BaseSetting.googleWebClientId, iosClientId: BaseSetting.googleIosClientId});
} catch (e) {
  GoogleSignin = null;
}

const {width, height} = Dimensions.get('window');

const STATUS_H = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const [googleLoader, setGoogleLoader] = useState(false);
  // A Gmail address can sign in with Google, so suggest it (only when the Google module is in this build).
  const isGmail = !!GoogleSignin && /^[^\s@]+@(gmail|googlemail)\.com$/i.test(email.trim());
  const [isFocused, setIsFocused] = useState({email: false, password: false});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [shadowActive, setShadowActive] = useState(false);
  const {setUserData, setAccessToken, setRefreshToken, setShopSelected} =
    authActions;
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
      // Android only exposes the model code (A069P); the name the phone calls itself (usually the
      // marketing name, e.g. "Nothing Phone (4a) Pro") comes from the device-name setting.
      let device_name = null;
      try {
        device_name = await DeviceInfo.getDeviceName();
      } catch (e) {}

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
        device_name,
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
        dispatch(setRefreshToken(data?.refreshToken || ''));
        navigation.reset({
          routes: [{name: 'Dashboard'}],
        });
      } else {
        if (isGmail && response.status === 401 && /password/i.test(data?.msg || '')) {
          Toast.show({
            type: 'info',
            text1: data?.msg,
            text2: 'Gmail account? Tap here to sign in with Google instead.',
            visibilityTime: 6000,
            onPress: () => {
              Toast.hide();
              handleGoogleLogin();
            },
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: data?.msg || 'Something went wrong!',
          });
        }
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

  // "Continue with Google": the backend only signs in a tenant whose email is this Google account's verified
  // email (tenants are created by admins; there is no self sign-up).
  const handleGoogleLogin = async () => {
    if (googleLoader || loader) {
      return;
    }
    setGoogleLoader(true);
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      try {
        await GoogleSignin.signOut(); // always show the account chooser
      } catch (e) {}
      const result = await GoogleSignin.signIn();
      if (result?.type === 'cancelled') {
        return;
      }
      const idToken = result?.data?.idToken || result?.idToken;
      if (!idToken) {
        throw new Error('no idToken');
      }
      const response = await fetch(BaseSetting.baseUrl + 'client/google-login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify({id_token: idToken, fcm_token: fcmToken, device_info: deviceInfo}),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (response.ok) {
        dispatch(setAccessToken(data?.accessToken));
        dispatch(setRefreshToken(data?.refreshToken || ''));
        navigation.reset({routes: [{name: 'Dashboard'}]});
      } else {
        Toast.show({type: 'error', text1: 'Google sign-in', text2: data?.msg || 'Something went wrong!'});
      }
    } catch (error) {
      if (error?.code === googleStatus.SIGN_IN_CANCELLED || error?.code === googleStatus.IN_PROGRESS) {
        return;
      }
      console.log('Google sign-in error:', error?.code, error?.message);
      Toast.show({
        type: 'error',
        text1: 'Google sign-in',
        text2:
          error?.code === googleStatus.PLAY_SERVICES_NOT_AVAILABLE
            ? 'Google Play services are not available on this phone.'
            : `Could not sign in with Google. Please try again.${IS_UAT ? ` (code ${error?.code ?? 'unknown'})` : ''}`,
      });
    } finally {
      setGoogleLoader(false);
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
      <LinearGradient
        colors={[Brand.gradientTop, Brand.gradientBottom]}
        style={styles.gradient}
      />
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
                // Same header with the keyboard open, just tighter and always below the status bar
                // (it used to jump above it and lose the tagline).
                marginTop: keyboardVisible ? STATUS_H + 16 : height * 0.08,
                marginBottom: keyboardVisible ? 18 : 30,
              },
            ]}>
            <BrandWordmark
              textStyle={[styles.title, keyboardVisible && {fontSize: 30, marginBottom: 4}]}
              markSize={keyboardVisible ? 30 : 52}
              greetingStyle={styles.festivalGreeting}
            />
            <Text style={[styles.subtitle, keyboardVisible && {fontSize: 13}]}>
              {Brand.tagline}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: formFade,
              },
            ]}>
            <Animated.View style={[styles.card, getCardShadowStyle()]}>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.welcomeSub}>Sign in to manage your rent, deposits and documents.</Text>

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
              {isGmail && !errors.email && (
                <Text style={styles.googleHint}>
                  Gmail account?{' '}
                  <Text style={styles.googleHintLink} onPress={handleGoogleLogin}>
                    Use Google instead
                  </Text>
                </Text>
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

              {!!GoogleSignin && (
                <>
                  <View style={styles.orRow}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>or</Text>
                    <View style={styles.orLine} />
                  </View>
                  <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} activeOpacity={0.85}>
                    {googleLoader ? (
                      <ActivityIndicator color={'#632240'} />
                    ) : (
                      <>
                        <IconFA name="google" brand size={18} color="#632240" />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
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
    bottom: 0,
    backgroundColor: '#632240',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 36,
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
    fontSize: 40,
    fontFamily: Brand.wordmarkFont,
    letterSpacing: Brand.wordmarkSpacing,
    color: '#fff',
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 24,
    fontFamily: Brand.wordmarkFont,
    letterSpacing: Brand.wordmarkSpacing,
    color: '#fff',
  },
  festivalGreeting: {color: '#FFD27A', fontSize: 14, fontWeight: '700', marginBottom: 8},
  subtitle: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.8,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 26,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F1F24',
  },
  welcomeSub: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7A7A85',
    marginTop: 4,
    marginBottom: 22,
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
  googleHint: {marginTop: -6, marginBottom: 14, marginLeft: 4, fontSize: 13, color: '#8A8A95'},
  googleHintLink: {color: '#632240', fontWeight: '700', textDecorationLine: 'underline'},
  orRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 16},
  orLine: {flex: 1, height: 1, backgroundColor: '#E5E5EA'},
  orText: {marginHorizontal: 12, color: '#8A8A95', fontSize: 14},
  googleButton: {
    height: 55,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#632240',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleButtonText: {color: '#632240', fontSize: 17, fontWeight: '600'},
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Login;
