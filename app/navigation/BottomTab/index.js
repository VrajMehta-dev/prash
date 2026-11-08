import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon, {Icons} from '@config/Icons';
import {translate} from '@lang/Translate';
import {tap} from '@utils/haptics';
import {Brand} from '@config/brand';
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

// Floating pill tab bar, four equal tabs.
// Routes (CustomDrawer): 0 Dashboard, 1 Bills, 2 Charges, 3 Profile.
const ICONS = {
  Dashboard: {type: Icons.Ionicons, name: 'home-outline', on: 'home'},
  Bills: {type: Icons.Ionicons, name: 'receipt-outline', on: 'receipt'},
  Charges: {type: Icons.Ionicons, name: 'layers-outline', on: 'layers'},
  Profile: {type: Icons.Ionicons, name: 'person-outline', on: 'person'},
};
const ACTIVE = Brand.primary; // selected tab: filled icon + label in the brand colour
const INACTIVE = '#9A9AA0';
const LABELS = {Dashboard: 'Home'}; // shorter than "Dashboard" so it never wraps

export default function BottomTabBar({state, descriptors, navigation}) {
  const renderTab = (route, index) => {
    const {options} = descriptors[route.key];
    const label = options.tabBarLabel || options.title || route.name;
    const focused = state.index === index;
    const icon = ICONS[route.name] || ICONS.Dashboard;
    const color = focused ? ACTIVE : INACTIVE;
    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={focused ? {selected: true} : {}}
        activeOpacity={0.7}
        style={styles.tab}
        onPress={() => {
          tap();
          if (!focused) navigation.navigate(route.name);
        }}>
        <TabIcon icon={icon} focused={focused} color={color} />
        <Text numberOfLines={1} style={[styles.label, {color, fontWeight: focused ? '700' : '500'}]}>
          {LABELS[route.name] || translate(label)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {state.routes.slice(0, 4).map((r, i) => renderTab(r, i))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4},
  label: {fontSize: 11},
});
