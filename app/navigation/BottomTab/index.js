import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon, {Icons} from '@config/Icons';
import {translate} from '@lang/Translate';
import {tap} from '@utils/haptics';
import {Brand} from '@config/brand';
import {navigationRef} from '../NavigationService';
import {openMore, useMoreOpen} from '@utils/moreMenu';
import {useSafeAreaInsets, initialWindowMetrics} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

// Space screens must leave at the bottom so content isn't hidden behind the floating bar.
// Space screens must leave at the bottom. On Android, phones with the 3-button navigation bar draw it over
// the app (edge-to-edge), so its height is added: the floating bar sits above it instead of under it.
const ANDROID_NAV = Platform.OS === 'android' ? initialWindowMetrics?.insets?.bottom || 0 : 0;
export const TAB_BAR_SPACE = 104 + ANDROID_NAV;

// Icon pops (squash then springy overshoot) when its tab becomes active.
const TabIcon = ({icon, focused, color}) => {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withTiming(0.78, {duration: 70}),
        withSpring(1, {damping: 5, stiffness: 320}),
      );
    }
  }, [focused]);
  const style = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));
  return (
    <Animated.View style={style}>
      <Icon
        type={icon.type}
        name={focused ? icon.on : icon.name}
        style={{fontSize: 24, color}}
      />
    </Animated.View>
  );
};

// Layout: [pill: Home | Rent | Extras | Pay] [round More]. More is set apart from the pill because it is not a screen: it opens
// the menu (components/MoreMenu), which takes the bar's place while it is open. Notifications live in the screen headers.
// Tab routes (CustomDrawer): Dashboard, Bills, Charges, Pay, Containers, Profile.
// Containers + Profile live under "More", so More is highlighted while either is open.
const PILL = [
  {key: 'Dashboard', label: 'Home', icon: {type: Icons.Ionicons, name: 'home-outline', on: 'home'}},
  {key: 'Bills', label: 'Rent', icon: {type: Icons.Ionicons, name: 'receipt-outline', on: 'receipt'}},
  {key: 'Charges', label: 'Extras', icon: {type: Icons.Ionicons, name: 'layers-outline', on: 'layers'}},
  {key: 'Pay', label: 'Pay', icon: {type: Icons.Ionicons, name: 'wallet-outline', on: 'wallet'}},
];
const MORE = {type: Icons.Ionicons, name: 'grid-outline', on: 'grid'};
const MORE_ROUTES = ['Containers', 'SecurityDeposit', 'PropertyDocuments'];
// Full-page screens reached from elsewhere (the avatar on Home, and Help & Support which opens from Profile): no bar on them.
const NO_BAR_ROUTES = ['Profile', 'HelpAndSupport'];
const ACTIVE = Brand.primary;
const INACTIVE = '#9A9AA0';

const TINT = Brand.primary + '1F'; // selector fill behind the active item
const BAR_PAD = 4;

export default function BottomTabBar({state, navigation}) {
  const insets = useSafeAreaInsets();
  const moreOpen = useMoreOpen();
  const [barW, setBarW] = useState(0);
  const current = state.routes[state.index]?.name;
  const activeIdx = PILL.findIndex(t => current === t.key);
  const moreFocused = MORE_ROUTES.includes(current) || moreOpen;
  const itemW = (barW - BAR_PAD * 2) / PILL.length;
  const slide = useSharedValue(0);
  const show = useSharedValue(0);
  useEffect(() => {
    if (activeIdx >= 0 && itemW > 0) {
      slide.value = withSpring(activeIdx * itemW, {damping: 16, stiffness: 220});
    }
    show.value = withTiming(activeIdx >= 0 ? 1 : 0, {duration: 150});
  }, [activeIdx, itemW]);
  // while the More menu is open it takes the bar's place: the bar sinks and fades, then springs back on close
  const away = useSharedValue(0);
  useEffect(() => {
    away.value = withSpring(moreOpen ? 1 : 0, {damping: 20, stiffness: 240});
  }, [moreOpen]);
  const rowStyle = useAnimatedStyle(() => ({
    opacity: 1 - away.value,
    transform: [{translateY: away.value * 28}, {scale: 1 - away.value * 0.06}],
  }));
  const selector = useAnimatedStyle(() => ({opacity: show.value, transform: [{translateX: slide.value}]}));

  const go = name => {
    tap();
    if (current !== name) navigation.navigate(name);
  };

  if (NO_BAR_ROUTES.includes(current)) return null;

  return (
    <View style={[styles.wrap, {paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 24) : 14 + insets.bottom}]}>
      <Animated.View style={[styles.row, rowStyle]} pointerEvents={moreOpen ? 'none' : 'auto'}>
        <View style={styles.bar} onLayout={e => setBarW(e.nativeEvent.layout.width)}>
          {itemW > 0 && <Animated.View pointerEvents="none" style={[styles.selector, {width: itemW}, selector]} />}
          {PILL.map(t => {
            const focused = current === t.key;
            const color = focused ? ACTIVE : INACTIVE;
            return (
              <TouchableOpacity
                key={t.key}
                accessibilityRole="button"
                accessibilityState={focused ? {selected: true} : {}}
                activeOpacity={0.7}
                style={styles.tab}
                onPress={() => go(t.key)}>
                <TabIcon icon={t.icon} focused={focused} color={color} />
                <Text numberOfLines={1} style={[styles.label, {color, fontWeight: focused ? '700' : '500'}]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="More"
          activeOpacity={0.8}
          style={styles.round}
          onPress={() => (tap(), openMore())}>
          {moreFocused && <View pointerEvents="none" style={styles.homeTint} />}
          <TabIcon icon={MORE} focused={moreFocused} color={moreFocused ? ACTIVE : INACTIVE} />
          <Text style={[styles.label, {color: moreFocused ? ACTIVE : INACTIVE, fontWeight: moreFocused ? '700' : '500'}]}>More</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const SHADOW = {
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 8},
  shadowOpacity: 0.12,
  shadowRadius: 18,
  elevation: 10,
};
const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  row: {flexDirection: 'row', alignItems: 'stretch', gap: 8},
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: 40,
    paddingVertical: 4,
    paddingHorizontal: BAR_PAD,
    borderWidth: 1,
    borderColor: '#fff',
    ...SHADOW,
  },
  round: {
    width: 72,
    borderRadius: 40,
    gap: 3,
    backgroundColor: '#F4F4F6',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  homeTint: {...StyleSheet.absoluteFillObject, borderRadius: 40, backgroundColor: TINT},
  selector: {position: 'absolute', top: BAR_PAD, bottom: BAR_PAD, left: BAR_PAD, borderRadius: 36, backgroundColor: TINT},
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 8},
  label: {fontSize: 11},
});
