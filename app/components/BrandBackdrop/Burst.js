import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import {CANVAS} from './layout';

const CX = CANVAS.w / 2;
const CY = CANVAS.h / 2;

// One Figma illustration: shoots out of the logo (centre) past its resting spot with a
// squash-and-stretch punch and a spin, then springs back and snaps into place.
export const BurstItem = ({it, index, delay, children}) => {
  const dx = it.cx - CX;
  const dy = it.cy - CY;
  const spin = (index % 2 ? 1 : -1) * (360 + (index % 3) * 180);
  const d = delay + index * 16;

  const tx = useSharedValue(-dx);
  const ty = useSharedValue(-dy);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const rot = useSharedValue(it.rot + spin);
  const op = useSharedValue(0);

  useEffect(() => {
    const out = {duration: 230, easing: Easing.out(Easing.cubic)};
    const bounce = {damping: 7, stiffness: 190, mass: 0.7};
    tx.value = withDelay(d, withSequence(withTiming(dx * 0.9, out), withSpring(0, bounce)));
    ty.value = withDelay(d, withSequence(withTiming(dy * 0.9, out), withSpring(0, bounce)));
    // squash & stretch: wide+flat on the way out, then settle to 1
    sx.value = withDelay(d, withSequence(withTiming(2.3, {duration: 170, easing: Easing.out(Easing.back(3))}), withSpring(1, {damping: 6, stiffness: 210})));
    sy.value = withDelay(d, withSequence(withTiming(1.5, {duration: 170, easing: Easing.out(Easing.back(3))}), withSpring(1, {damping: 6, stiffness: 210})));
    rot.value = withDelay(d, withTiming(it.rot, {duration: 560, easing: Easing.out(Easing.cubic)}));
    // full-strength during the burst, then quickly down to the design's faint resting opacity
    op.value = withDelay(d, withSequence(withTiming(1, {duration: 50}), withDelay(300, withTiming(it.opacity, {duration: 160}))));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [
      {translateX: tx.value},
      {translateY: ty.value},
      {rotate: `${rot.value}deg`},
      {scaleX: sx.value},
      {scaleY: sy.value},
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: it.cx - it.w / 2,
          top: it.cy - it.h / 2,
          width: it.w,
          height: it.h,
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
};

// Confetti: bright abstract shapes that fly out, spin, pop and vanish (not part of the final logo).
const PALETTE = ['#FFFFFF', '#FFD166', '#FF7AA8', '#C9A7FF', '#FFB4A2'];
const SHAPES = Array.from({length: 22}, (_, i) => {
  // small deterministic pseudo-random so the burst looks the same every launch
  const r = n => ((Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    angle: (i / 22) * Math.PI * 2 + r(1) * 0.5,
    dist: 110 + r(2) * 260,
    size: 9 + r(3) * 17,
    color: PALETTE[i % PALETTE.length],
    kind: i % 4, // 0 dot, 1 ring, 2 square, 3 triangle
    spin: (r(4) > 0.5 ? 1 : -1) * (360 + r(5) * 540),
    wait: r(6) * 90,
  };
});

const Shape = ({s, delay}) => {
  const p = useSharedValue(0); // 0 -> 1 outward travel
  const sc = useSharedValue(0);
  const rot = useSharedValue(0);
  const op = useSharedValue(0);
  useEffect(() => {
    const d = delay + s.wait;
    p.value = withDelay(d, withTiming(1, {duration: 520, easing: Easing.out(Easing.exp)}));
    sc.value = withDelay(d, withSequence(withTiming(1.5, {duration: 150, easing: Easing.out(Easing.back(3))}), withDelay(120, withTiming(0, {duration: 190, easing: Easing.in(Easing.cubic)}))));
    rot.value = withDelay(d, withTiming(s.spin, {duration: 520}));
    op.value = withDelay(d, withSequence(withTiming(1, {duration: 30}), withDelay(380, withTiming(0, {duration: 100}))));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [
      {translateX: Math.cos(s.angle) * s.dist * p.value},
      {translateY: Math.sin(s.angle) * s.dist * p.value},
      {rotate: `${rot.value}deg`},
      {scale: sc.value},
    ],
  }));
  const base = {width: s.size, height: s.size};
  const shape =
    s.kind === 0 ? {...base, borderRadius: s.size / 2, backgroundColor: s.color}
    : s.kind === 1 ? {...base, borderRadius: s.size / 2, borderWidth: 3, borderColor: s.color}
    : s.kind === 2 ? {...base, borderRadius: 3, backgroundColor: s.color}
    : {width: 0, height: 0, borderLeftWidth: s.size / 2, borderRightWidth: s.size / 2, borderBottomWidth: s.size, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: s.color};
  return (
    <Animated.View
      pointerEvents="none"
      style={[{position: 'absolute', left: CX - s.size / 2, top: CY - s.size / 2}, style]}>
      <View style={shape} />
    </Animated.View>
  );
};

export const Confetti = ({delay}) => (
  <>
    {SHAPES.map((s, i) => (
      <Shape key={i} s={s} delay={delay} />
    ))}
  </>
);
