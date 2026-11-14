import React from 'react';
import {Dimensions} from 'react-native';
import {useIsFocused, useRoute} from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

// Position of each tab, left to right as the navbar lays them out (Home | Rent, Extras, Pay, More -> the More
// destinations). Going to a tab on the right slides it in from the right; going left slides it in from the left,
// so moving between tabs feels like moving across the app (react-navigation v6 tabs have no built-in transition).
const ORDER = [
  'Dashboard',
  'Bills',
  'Charges',
  'Pay',
  'Containers',
  'SecurityDeposit',
  'Contracts',
  'Compliance',
  'PropertyDocuments',
  'HelpAndSupport',
  'Profile',
];
const SLIDE = Dimensions.get('window').width; // a pure slide: the new screen travels the full width from its side, no fade
let lastIndex = 0;

export default function withTabTransition(Screen) {
  function WithTabTransition(props) {
    const focused = useIsFocused();
    const idx = Math.max(0, ORDER.indexOf(useRoute().name));
    const p = useSharedValue(focused ? 1 : 0);
    const dir = useSharedValue(0); // +1: enters from the right, -1: from the left
    React.useEffect(() => {
      if (focused) {
        dir.value = idx >= lastIndex ? 1 : -1;
        lastIndex = idx;
        cancelAnimation(p);
        p.value = 0;
        p.value = withTiming(1, {duration: 300, easing: Easing.out(Easing.cubic)});
      } else {
        p.value = 0;
      }
    }, [focused]);
    const style = useAnimatedStyle(() => ({
      flex: 1,
      transform: [{translateX: dir.value * SLIDE * (1 - p.value)}],
    }));
    return (
      <Animated.View style={style}>
        <Screen {...props} />
      </Animated.View>
    );
  }
  return WithTabTransition;
}
