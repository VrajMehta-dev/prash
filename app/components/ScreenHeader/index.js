import React from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsFocused} from '@react-navigation/native';
import {Brand} from '@config/brand';

// The one page header: brand gradient, title, subtitle (usually the outlet). Pads for the status bar /
// notch from the real safe-area inset so nothing is cut off. `overlap` leaves room for a card that
// slides up over the header's bottom edge.
export default function ScreenHeader({title, subtitle, overlap, children}) {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  return (
    <LinearGradient
      colors={[Brand.gradientTop, Brand.gradientBottom]}
      style={[styles.hero, {paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) + 16, paddingBottom: overlap ? 76 : 22}]}>
      {focused && <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {!!subtitle && <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text>}
      {children}
    </LinearGradient>
  );
}

// Top padding other custom heroes (Home, Account) should use for the same inset.
export const useHeaderTop = () => {
  const insets = useSafeAreaInsets();
  return Math.max(insets.top, StatusBar.currentHeight || 0) + 16;
};

const styles = StyleSheet.create({
  hero: {paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30},
  title: {color: '#fff', fontSize: 26, fontWeight: 'bold'},
  sub: {color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2},
});
