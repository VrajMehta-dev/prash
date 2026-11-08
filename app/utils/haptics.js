import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Light tap for any button press. Never throws: haptics must not break a press.
let last = 0;
export const tap = (type = 'impactLight') => {
  const now = Date.now();
  if (now - last < 80) {
    return;
  }
  last = now;
  try {
    ReactNativeHapticFeedback.trigger(type, {enableVibrateFallback: true});
  } catch (e) {}
};

// Wrap a handler so it taps first: onPress={withTap(handler)}
export const withTap = handler => (...args) => {
  tap();
  return handler?.(...args);
};
