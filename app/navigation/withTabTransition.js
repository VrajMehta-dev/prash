import React from 'react';
import {useIsFocused} from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Wraps a tab screen so it fades + rises into place each time its tab is selected
// (react-navigation v6 bottom tabs have no built-in transition).
export default function withTabTransition(Screen) {
  function WithTabTransition(props) {
    const focused = useIsFocused();
    const p = useSharedValue(focused ? 1 : 0);
    React.useEffect(() => {
      p.value = focused
        ? withTiming(1, {duration: 260, easing: Easing.out(Easing.cubic)})
        : 0;
    }, [focused]);
    const style = useAnimatedStyle(() => ({
      flex: 1,
      opacity: 0.35 + 0.65 * p.value,
      transform: [{translateY: 16 * (1 - p.value)}],
    }));
    return (
      <Animated.View style={style}>
        <Screen {...props} />
      </Animated.View>
    );
  }
  return WithTabTransition;
}
