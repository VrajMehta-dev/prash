import React, {useEffect, forwardRef, useImperativeHandle} from 'react';
import {StyleSheet, TouchableWithoutFeedback} from 'react-native';
import Animated, {
  interpolateColor,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';

const CSwitch = forwardRef((props, ref) => {
  const {onPress = () => {}, isActive} = props;

  // value for Switch Animation
  const switchTranslate = useSharedValue(0);
  // state for activate Switch
  // const [isActive, setActive] = useState(false);
  // Progress Value
  const progress = useDerivedValue(() => {
    return withTiming(isActive ? 28 : 4);
  });

  // useEffect for change the switchTranslate Value
  useEffect(() => {
    if (isActive) {
      switchTranslate.value = 28;
    } else {
      switchTranslate.value = 4;
    }
  }, [isActive, switchTranslate]);

  // Custom hook for handling imperative logic with refs
  useImperativeHandle(ref, () => ({
    value() {
      return isActive || false;
    },
    // setValue(value) {
    //   setActive(value);
    // },
  }));

  // Circle Animation
  const customSpringStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(switchTranslate.value, {
            mass: 1,
            damping: 15,
            stiffness: 120,
            overshootClamping: false,
            restSpeedThreshold: 0.001,
            restDisplacementThreshold: 0.001,
          }),
        },
      ],
    };
  });

  // Background Color Animation
  const backgroundColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 22],
      ['#E0E0E0', '#057FFF'],
    );
    return {
      backgroundColor,
    };
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress();
      }}>
      <Animated.View style={[styles.container, backgroundColorStyle]}>
        <Animated.View style={[styles.circle, customSpringStyles]} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

export default CSwitch;

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 25,
    borderRadius: 30,
    justifyContent: 'center',
    backgroundColor: '#E0E0E0',
  },
  circle: {
    height: 18,
    width: 18,
    borderRadius: 30,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
});
