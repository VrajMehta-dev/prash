import React, {useContext, useEffect, useRef, useState} from 'react';
import {Animated, BackHandler, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaInsetsContext, initialWindowMetrics} from 'react-native-safe-area-context';
import {tap} from '@utils/haptics';
import {closeMore, useMoreOpen} from '@utils/moreMenu';
import {navigationRef} from '../../navigation/NavigationService';

const ITEMS = [
  {name: 'Containers', icon: 'cube-outline', title: 'Container Charges'},
  {name: 'SecurityDeposit', icon: 'shield-checkmark-outline', title: 'Security Deposit'},
  {name: 'PropertyDocuments', icon: 'document-text-outline', title: 'Shop Documents'},
];

// The "More" menu: it takes the place of the bottom bar (the bar fades out, see navigation/BottomTab) and springs open from the
// More button; tapping outside, a menu item or the back button springs it shut and the bar comes back.
// A plain absolute overlay, not a native <Modal> (a dismissed Modal can leave a window that swallows touches on Android).
export default function MoreMenu() {
  const open = useMoreOpen();
  // mounted above the SafeAreaProvider, so read the context defensively instead of the throwing hook
  const insets = useContext(SafeAreaInsetsContext) || initialWindowMetrics?.insets || {bottom: 0};
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (open) {
      setCurrent(navigationRef.current?.getCurrentRoute()?.name);
      setMounted(true);
      Animated.spring(progress, {toValue: 1, stiffness: 240, damping: 19, mass: 1, useNativeDriver: true}).start();
    } else if (mounted) {
      Animated.spring(progress, {toValue: 0, stiffness: 320, damping: 30, mass: 1, overshootClamping: true, useNativeDriver: true}).start(
        ({finished}) => finished && setMounted(false),
      );
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => (closeMore(), true));
    return () => sub.remove();
  }, [open]);

  if (!mounted) return null;

  const bottom = Platform.OS === 'ios' ? Math.max(insets.bottom, 24) : 14 + insets.bottom;
  const backdrop = progress.interpolate({inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp'});
  const card = {
    opacity: progress.interpolate({inputRange: [0, 0.35, 1], outputRange: [0, 1, 1], extrapolate: 'clamp'}),
    transform: [
      {translateY: progress.interpolate({inputRange: [0, 1], outputRange: [44, 0]})},
      {scale: progress.interpolate({inputRange: [0, 1], outputRange: [0.55, 1]})},
    ],
  };

  return (
    <View style={styles.overlay} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, {opacity: backdrop}]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMore} accessibilityLabel="Close menu" />
      </Animated.View>
      <Animated.View style={[styles.card, {bottom, transformOrigin: 'bottom right'}, card]}>
        {ITEMS.map(it => {
          const active = current === it.name;
          return (
            <Pressable
              key={it.name}
              accessibilityRole="button"
              onPress={() => {
                tap();
                closeMore();
                // the bar (and so this menu) is only on tab screens, so a plain navigate reaches the sibling tab; goToTab would land on the
                // tab named 'Dashboard' (Home) because that is also the name of its parent route
                if (!active) navigationRef.current?.navigate(it.name);
              }}
              style={({pressed}) => [styles.row, (active || pressed) && styles.rowActive]}>
              <Icon name={it.icon} size={22} color={active ? '#17171C' : '#8A8A95'} />
              <Text style={[styles.title, active && styles.titleActive]}>{it.title}</Text>
              <Icon name="chevron-forward" size={20} color={active ? '#17171C' : '#B5B5BD'} />
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {...StyleSheet.absoluteFillObject, zIndex: 9000, elevation: 90},
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,10,30,0.42)'},
  card: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 24,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 17, paddingHorizontal: 18, borderRadius: 26},
  rowActive: {backgroundColor: '#F2F2F4'},
  title: {flex: 1, fontSize: 16, fontWeight: '600', color: '#8A8A95'},
  titleActive: {color: '#17171C', fontWeight: '700'},
});
