// Haptics live in a native module that older UAT APKs don't have. An OTA bundle must never crash
// such a build, so the library is loaded defensively: no module => silently no haptics.
let Haptics = null;
try {
  const mod = require('react-native-haptic-feedback');
  Haptics = mod?.default || mod;
} catch (e) {}

// Light tap for any button press. Never throws: haptics must not break a press.
let last = 0;
export const tap = (type = 'impactLight') => {
  if (!Haptics?.trigger) {
    return;
  }
  const now = Date.now();
  if (now - last < 80) {
    return;
  }
  last = now;
  try {
    Haptics.trigger(type, {enableVibrateFallback: true});
  } catch (e) {}
};

// Wrap a handler so it taps first: onPress={withTap(handler)}
export const withTap = handler => (...args) => {
  tap();
  return handler?.(...args);
};
