import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Light tap for any button press. Never throws: haptics must not break a press.
export const tap = (type = 'impactLight') => {
  try {
    ReactNativeHapticFeedback.trigger(type, {enableVibrateFallback: true});
  } catch (e) {}
};

// Wrap a handler so it taps first: onPress={withTap(handler)}
export const withTap = handler => (...args) => {
  tap();
  return handler?.(...args);
};
