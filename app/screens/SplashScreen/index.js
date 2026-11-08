import React, {useEffect} from 'react';
import {Text, StyleSheet, Platform, PermissionsAndroid, StatusBar} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {Brand} from '@config/brand';
import BrandBackdrop from '@components/BrandBackdrop';

const SplashScreen = ({navigation}) => {
  const {accessToken} = useSelector(state => state.auth);
  const logo = useSharedValue(0);

  useEffect(() => {
    checkNotificationPermission();
    logo.value = withTiming(1, {duration: 700, easing: Easing.out(Easing.cubic)});
  }, []);

  async function checkNotificationPermission() {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = await DeviceInfo.getApiLevel();
        if (androidVersion >= 33) {
          await PermissionsAndroid.request(
            'android.permission.POST_NOTIFICATIONS',
          );
        }
      } catch (error) {
        console.error('Permission Error:', error);
      }
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.reset({
        routes: [{name: accessToken ? 'Dashboard' : 'Login'}],
      });
    }, 2200);
    return () => clearTimeout(timeout);
  }, [accessToken]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logo.value,
    transform: [{scale: 0.92 + 0.08 * logo.value}],
  }));

  return (
    <BrandBackdrop style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Brand.gradientTop} />
      <Animated.View style={logoStyle}>
        <Text style={styles.wordmark}>{Brand.name}</Text>
      </Animated.View>
    </BrandBackdrop>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordmark: {
    color: '#fff',
    fontFamily: Brand.wordmarkFont,
    fontSize: 52,
    letterSpacing: Brand.wordmarkSpacing,
  },
});

export default SplashScreen;
