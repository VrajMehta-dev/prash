import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {translate} from '@lang/Translate';

const {width} = Dimensions.get('window');

const ForgotPassword = ({navigation, route}) => {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleResetPassword = () => {
    if (!email) {
      setError('Please enter your email address');
      shakeError();
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      shakeError();
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 1500);
  };

  if (isSuccess) {
    setTimeout(() => {
      navigation.replace('OTPVerification', {email: email, isForgot: true});
    }, 1000);
    return (
      <Animated.View
        style={[
          styles.container,
          {opacity: fadeAnim, justifyContent: 'center'},
        ]}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.successCircle}>
          <Icon name="check" size={50} color="#fff" />
        </LinearGradient>
        <Text style={styles.successTitle}>Email Sent Successfully!</Text>
        <Text style={styles.successText}>
          Please check your inbox for password reset instructions.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setIsSuccess(false);
            setEmail('');
          }}>
          <Text style={styles.backButtonText}>Return to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#632240', '#632240']}
            style={styles.headerGradient}>
            <Icon name="lock-outline" size={40} color="#fff" />
          </LinearGradient>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>{translate('Forgot Password')}</Text>
            <Text style={styles.subtitle}>
              {translate(
                "No worries! Enter your email and we'll send you reset instructions",
              )}
            </Text>

            <Animated.View
              style={[
                styles.inputWrapper,
                {transform: [{translateX: shakeAnimation}]},
              ]}>
              <View style={[styles.inputContainer, error && styles.inputError]}>
                <Icon
                  name="email"
                  size={24}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={'Email'}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setError('');
                  }}
                  placeholderTextColor={'black'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => setEmail('')}>
                    <Icon name="close" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
              {error ? (
                <Text style={styles.errorText}>
                  <Icon name="error-outline" size={14} color="#FF5252" />{' '}
                  {error}
                </Text>
              ) : null}
            </Animated.View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
              disabled={isLoading}>
              <LinearGradient
                colors={['#632240', '#632240']}
                style={styles.gradient}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Icon
                      name="refresh"
                      size={24}
                      color="#fff"
                      style={styles.loadingIcon}
                    />
                  </View>
                ) : (
                  <Text style={styles.buttonText}>
                    {translate('Reset Password')}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={20} color="#666" />
              <Text style={styles.backToLoginText}>
                {translate('Back to Login')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  contentContainer: {
    width: '90%',
    maxWidth: 400,
    marginTop: -50,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#FF5252',
    backgroundColor: '#FFEBEE',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    transform: [{rotate: '0deg'}],
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
  },
  backToLoginText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 5,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  backButton: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    width: '80%',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ForgotPassword;
