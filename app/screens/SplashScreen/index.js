import React, {useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  StatusBar,
  AccessibilityInfo,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {Brand} from '@config/brand';
import BrandBackdrop from '@components/BrandBackdrop';
import {tap} from '@utils/haptics';

const BURST_AT = 350; // clean logo shows first, then it "goes off"
const NAVIGATE_AT = 2400;

const SplashScreen = ({navigation}) => {
  const {accessToken} = useSelector(state => state.auth);
  const [animated, setAnimated] = useState(true);
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);

  useEffect(() => {
    checkNotificationPermission();
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (alive && reduce) {
        setAnimated(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!animated) {
      return;
    }
    // Impact punch on the wordmark: squash flat/wide, stretch tall, wobble, settle.
    const t = n => withTiming(n, {duration: 90, easing: Easing.out(Easing.quad)});
    sx.value = withDelay(BURST_AT, withSequence(t(1.35), t(0.85), t(1.1), t(0.97), t(1)));
    sy.value = withDelay(BURST_AT, withSequence(t(0.6), t(1.3), t(0.9), t(1.04), t(1)));
    const hit = setTimeout(() => tap('impactHeavy'), BURST_AT);
    return () => clearTimeout(hit);
  }, [animated]);

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
    }, NAVIGATE_AT);
    return () => clearTimeout(timeout);
  }, [accessToken]);

  const wordmarkStyle = useAnimatedStyle(() => ({
    transform: [{scaleX: sx.value}, {scaleY: sy.value}],
  }));

  return (
    <BrandBackdrop
      style={styles.container}
      illustrations
      animated={animated}
      burstDelay={BURST_AT}>
      <StatusBar barStyle="light-content" backgroundColor={Brand.gradientTop} />
      <Animated.View style={wordmarkStyle}>
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
