import React from 'react';
import {Pressable} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {tap} from '@utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Drop-in replacement for TouchableOpacity used across the app: presses squash the element with a
// stiff spring and release with a bouncy overshoot, plus a light haptic tick. One view node, so
// layout (flex/absolute/margins) behaves exactly like TouchableOpacity.
export default function PressableScale({
  style,
  onPress,
  onPressIn,
  onPressOut,
  activeOpacity, // accepted for compatibility; physics replaces the dimming
  scaleTo = 0.95,
  haptic = true,
  children,
  ...rest
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={e => {
        scale.value = withSpring(scaleTo, {damping: 15, stiffness: 420});
        onPressIn?.(e);
      }}
      onPressOut={e => {
        scale.value = withSpring(1, {damping: 7, stiffness: 320, mass: 0.6});
        onPressOut?.(e);
      }}
      onPress={
        onPress
          ? e => {
              if (haptic) {
                tap();
              }
              onPress(e);
            }
          : undefined
      }
      style={[style, animated]}>
      {children}
    </AnimatedPressable>
  );
}
