import React, {useEffect} from 'react';
import {Text, StyleSheet, Platform, PermissionsAndroid, StatusBar} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {Brand} from '@config/brand';

const SplashScreen = ({navigation}) => {
  const {accessToken} = useSelector(state => state.auth);
  const logo = useSharedValue(0);
  const tag = useSharedValue(0);

  useEffect(() => {
    checkNotificationPermission();
    logo.value = withTiming(1, {duration: 700, easing: Easing.out(Easing.cubic)});
    tag.value = withDelay(500, withTiming(1, {duration: 600}));
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
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tag.value,
    transform: [{translateY: 8 * (1 - tag.value)}],
  }));

  return (
    <Animated.View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Brand.primary} />
      <Animated.View style={logoStyle}>
        <Text style={styles.wordmark}>{Brand.name}</Text>
      </Animated.View>
      <Animated.View style={tagStyle}>
        <Text style={styles.tagline}>{Brand.tagline}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Brand.primary,
  },
  wordmark: {
    color: '#fff',
    fontFamily: Brand.wordmarkFont,
    fontSize: 46,
    letterSpacing: 4,
  },
  tagline: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
