import React, {useEffect} from 'react';
import {
  Text,
  View,
  Platform,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {SvgXml} from 'react-native-svg';
import {useSelector} from 'react-redux';

const {width, height} = Dimensions.get('window');

// Food plate SVG icon
const plateSvg = `
<svg viewBox="0 0 100 100">
<circle cx="50" cy="50" r="45" stroke="#632240" stroke-width="2" fill="none"/>
<circle cx="50" cy="50" r="40" stroke="#632240" stroke-width="4" fill="none"/>
<path d="M30 50 Q50 30 70 50" stroke="#632240" stroke-width="3" fill="none"/>
</svg>
`;

const SplashScreen = ({navigation}) => {
  // Animation shared values
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textSlide = useSharedValue(50);
  const plateScale = useSharedValue(0);
  const plateRotate = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const {accessToken} = useSelector(state => state.auth);

  useEffect(() => {
    checkNotificationPermission();
    startAnimation();
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

  const startAnimation = () => {
    // Plate animation
    plateScale.value = withSequence(
      withTiming(1.2, {duration: 800, easing: Easing.elastic}),
      withTiming(1, {duration: 400}),
    );
    plateRotate.value = withSequence(
      withTiming(360, {duration: 1000}),
      withTiming(0, {duration: 500}),
    );

    // Circle background animation
    circleScale.value = withTiming(1, {duration: 1000});

    // Text animations
    textOpacity.value = withDelay(400, withTiming(1, {duration: 800}));
    textSlide.value = withDelay(
      400,
      withSpring(0, {
        damping: 12,
        stiffness: 100,
      }),
    );
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      let routes = [];

      if (accessToken) {
        routes = [{name: 'Dashboard'}];
      } else {
        routes = [{name: 'Login'}];
      }

      navigation.reset({
        routes: routes,
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [accessToken]);
  // Animated styles
  const plateStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: -plateScale.value},
      {rotate: `${-plateRotate.value}deg`},
    ],
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{scale: circleScale.value}],
    opacity: circleScale.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{translateY: textSlide.value}],
  }));

  return (
    <View style={styles.container}>
      {/* Background Circle */}
      <Animated.View style={[styles.backgroundCircle, circleStyle]} />

      {/* Plate Icon */}
      <Animated.View style={[styles.plateContainer, plateStyle]}>
        <SvgXml xml={plateSvg} width={120} height={120} />
      </Animated.View>

      {/* Company Name */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.companyName}>Prayashmay Hospitality</Text>
        <Text style={styles.privateLimited}>Private Limited</Text>
        <Text style={styles.tagline}>Serving Happiness</Text>
      </Animated.View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  backgroundCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: '#fff5f5',
  },
  plateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#632240',
    marginBottom: 4,
  },
  privateLimited: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
};

export default SplashScreen;
