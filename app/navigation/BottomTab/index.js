import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon, {Icons} from '@config/Icons';
import {translate} from '@lang/Translate';
import {tap} from '@utils/haptics';
import {Brand} from '@config/brand';
import {useUnreadCount} from '@utils/useUnreadCount';
import {navigationRef} from '../NavigationService';
import MoreSheet from './MoreSheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

// Space screens must leave at the bottom so content isn't hidden behind the floating bar.
export const TAB_BAR_SPACE = 104;

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

// Layout: [round Home] [pill: Rent | Extras | Pay | More] [round Notifications].
// Tab routes (CustomDrawer): Dashboard, Bills, Charges, Pay, Containers, Profile.
// Containers + Profile live under "More", so More is highlighted while either is open.
const PILL = [
  {key: 'Bills', label: 'Rent', icon: {type: Icons.Ionicons, name: 'receipt-outline', on: 'receipt'}},
  {key: 'Charges', label: 'Extras', icon: {type: Icons.Ionicons, name: 'layers-outline', on: 'layers'}},
  {key: 'Pay', label: 'Pay', icon: {type: Icons.Ionicons, name: 'wallet-outline', on: 'wallet'}},
  {key: 'More', label: 'More', icon: {type: Icons.Ionicons, name: 'grid-outline', on: 'grid'}},
];
const HOME = {type: Icons.Ionicons, name: 'home-outline', on: 'home'};
const BELL = {type: Icons.Ionicons, name: 'notifications-outline', on: 'notifications'};
const MORE_ROUTES = ['Containers', 'Profile'];
const ACTIVE = Brand.primary;
const INACTIVE = '#9A9AA0';

export default function BottomTabBar({state, navigation}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const unread = useUnreadCount();
  const current = state.routes[state.index]?.name;

  const go = name => {
    tap();
    if (current !== name) navigation.navigate(name);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Home"
          activeOpacity={0.8}
          style={[styles.round, current === 'Dashboard' && {backgroundColor: ACTIVE}]}
          onPress={() => go('Dashboard')}>
          <TabIcon icon={HOME} focused={current === 'Dashboard'} color={current === 'Dashboard' ? '#fff' : ACTIVE} />
        </TouchableOpacity>

        <View style={styles.bar}>
          {PILL.map(t => {
            const focused = t.key === 'More' ? MORE_ROUTES.includes(current) || moreOpen : current === t.key;
            const color = focused ? ACTIVE : INACTIVE;
            return (
              <TouchableOpacity
                key={t.key}
                accessibilityRole="button"
                accessibilityState={focused ? {selected: true} : {}}
                activeOpacity={0.7}
                style={styles.tab}
                onPress={() => (t.key === 'More' ? (tap(), setMoreOpen(true)) : go(t.key))}>
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
          accessibilityLabel="Notifications"
          activeOpacity={0.8}
          style={styles.round}
          onPress={() => {
            tap();
            navigationRef.current?.navigate('NotificationScreen');
          }}>
          <TabIcon icon={BELL} focused={false} color={ACTIVE} />
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <MoreSheet
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        onGo={name => {
          setMoreOpen(false);
          if (name === 'Containers' || name === 'Profile') go(name);
          else navigationRef.current?.navigate(name);
        }}
      />
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
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#fff',
    ...SHADOW,
  },
  round: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F4F4F6',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: ACTIVE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F4F4F6',
  },
  badgeText: {color: '#fff', fontSize: 10, fontWeight: 'bold'},
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4},
  label: {fontSize: 11},
});
