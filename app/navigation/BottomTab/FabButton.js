/* eslint-disable react-hooks/exhaustive-deps */
import {StyleSheet, View, Pressable} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import React, {forwardRef, useCallback, useImperativeHandle} from 'react';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon, {Icons} from '@config/Icons';
import {useNavigation} from '@react-navigation/native';
import {translate} from '@lang/Translate';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CFabButton = forwardRef((props, ref) => {
  const navigation = useNavigation();
  // Animation shared values
  const firstValue = useSharedValue(0);
  const secondValue = useSharedValue(30);
  const firstWidth = useSharedValue(60);
  const secondWidth = useSharedValue(60);
  const isOpen = useSharedValue(false);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  // New shared values for press opacity
  const firstPressOpacity = useSharedValue(1);
  const secondPressOpacity = useSharedValue(1);
  const mainPressOpacity = useSharedValue(1);

  useImperativeHandle(ref, () => ({
    open() {
      // setShow(true);
    },
    close() {
      onClose();
      // setShow(false);
    },
  }));

  const progress = useDerivedValue(() =>
    isOpen.value
      ? withSpring(1, {
          damping: 12,
          stiffness: 100,
        })
      : withSpring(0, {
          damping: 12,
          stiffness: 100,
        }),
  );

  const springConfig = {
    damping: 15,
    mass: 0.6,
    stiffness: 140,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  };

  const timingConfig = {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  };

  const handlePress = useCallback(() => {
    // Main button press opacity animation
    mainPressOpacity.value = withSequence(
      withTiming(0.7, {duration: 100}),
      withTiming(1, {duration: 100}),
    );

    scale.value = withSequence(
      withSpring(0.9, {duration: 100}),
      withSpring(1.1, {duration: 100}),
      withSpring(1, {duration: 100}),
    );

    if (isOpen.value) {
      firstWidth.value = withTiming(60, {duration: 200});
      secondWidth.value = withTiming(60, {duration: 200});
      opacity.value = withTiming(0, {duration: 200});
      firstValue.value = withDelay(100, withSpring(30, springConfig));
      secondValue.value = withDelay(50, withSpring(30, springConfig));
    } else {
      firstValue.value = withDelay(100, withSpring(130, springConfig));
      secondValue.value = withSpring(210, springConfig);
      opacity.value = withDelay(200, withSpring(1, springConfig));
      firstWidth.value = withDelay(250, withSpring(200, springConfig));
      secondWidth.value = withDelay(200, withSpring(200, springConfig));
    }
    isOpen.value = !isOpen.value;
  }, []);

  const onClose = () => {
    scale.value = withSpring(1, {duration: 200});
    progress.value = withSpring(0, {duration: 200});
    firstWidth.value = withTiming(60, {duration: 200});
    secondWidth.value = withTiming(60, {duration: 200});
    opacity.value = withTiming(0, {duration: 200});
    firstValue.value = withDelay(100, withSpring(30, springConfig));
    secondValue.value = withDelay(50, withSpring(30, springConfig));
    isOpen.value = false;
  };

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}, {rotate: `${progress.value * 135}deg`}],
    opacity: mainPressOpacity.value,
  }));

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const firstWidthStyle = useAnimatedStyle(() => ({
    width: firstWidth.value,
  }));

  const secondWidthStyle = useAnimatedStyle(() => ({
    width: secondWidth.value,
  }));

  const firstIcon = useAnimatedStyle(() => {
    const iconScale = interpolate(
      firstValue.value,
      [30, 130],
      [0.3, 1],
      Extrapolation.CLAMP,
    );

    return {
      bottom: firstValue.value - 40,
      transform: [
        {scale: iconScale},
        {rotate: `${(1 - progress.value) * -30}deg`},
      ],
      opacity:
        interpolate(firstValue.value, [30, 80], [0, 1], Extrapolation.CLAMP) *
        firstPressOpacity.value,
    };
  });

  const secondIcon = useAnimatedStyle(() => {
    const iconScale = interpolate(
      secondValue.value,
      [30, 210],
      [0.3, 1],
      Extrapolation.CLAMP,
    );

    return {
      bottom: secondValue.value - 40,
      transform: [
        {scale: iconScale},
        {rotate: `${(1 - progress.value) * 30}deg`},
      ],
      opacity:
        interpolate(secondValue.value, [30, 80], [0, 1], Extrapolation.CLAMP) *
        secondPressOpacity.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: isOpen.value
      ? withTiming('rgba(0,0,0,0.5)', timingConfig)
      : withTiming('transparent', timingConfig),
  }));

  const handleCreatePost = () => {
    // Post button press opacity animation
    secondPressOpacity.value = withSequence(
      withTiming(0.7, {duration: 100}),
      withTiming(1, {duration: 100}),
    );
    navigation.navigate('CreatePost');
    setTimeout(() => {
      onClose();
    }, 500);
    // Add your create post logic here
  };

  const handleCreateTrip = () => {
    // Trip button press opacity animation
    firstPressOpacity.value = withSequence(
      withTiming(0.7, {duration: 100}),
      withTiming(1, {duration: 100}),
    );
    navigation.navigate('CreateTrip');
    setTimeout(() => {
      onClose();
    }, 500);
    // Add your create trip logic here
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.fabContainer}>
        {/* Create Post Button */}
        <AnimatedPressable
          onPress={handleCreatePost}
          style={[styles.contentContainer, secondIcon, secondWidthStyle]}>
          <View style={styles.iconContainer}>
            <Icon type={Icons.Ionicons} name="image" size={24} color="#fff" />
          </View>
          <Animated.Text style={[styles.text, opacityStyle]}>
            {translate('createPost')}
          </Animated.Text>
        </AnimatedPressable>

        {/* Create Trip Button */}
        <AnimatedPressable
          onPress={handleCreateTrip}
          style={[styles.contentContainer, firstIcon, firstWidthStyle]}>
          <View style={styles.iconContainer}>
            <Icon
              type={Icons.Ionicons}
              name="airplane"
              size={24}
              color="#fff"
            />
          </View>
          <Animated.Text style={[styles.text, opacityStyle]}>
            {translate('createTrip')}
          </Animated.Text>
        </AnimatedPressable>

        {/* Main FAB Button */}
        <AnimatedPressable
          style={styles.contentContainer}
          onPress={handlePress}>
          <Animated.View style={[styles.iconContainer, mainButtonStyle]}>
            <Icon type={Icons.Octicons} name="plus" size={26} color="white" />
          </Animated.View>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
});

export default CFabButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 300,
  },
  contentContainer: {
    overflow: 'hidden',
    backgroundColor: '#2563eb',
    position: 'absolute',
    bottom: 0,
    borderRadius: 50,
    width: 60,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 20,
  },
});
