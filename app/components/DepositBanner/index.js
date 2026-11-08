import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Brand} from '@config/brand';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

// Shown while an outlet's security deposit is unpaid (payments are paused until it is).
export default function DepositBanner({deposit, onPress, style}) {
  if (!deposit?.locked) {
    return null;
  }
  return (
    <TouchableOpacity onPress={onPress} style={[styles.wrap, style]}>
      <View style={styles.icon}>
        <Icon name="lock-outline" size={20} color="#9A5B00" />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.title}>Security deposit due {money(deposit.amount)}</Text>
        <Text style={styles.sub}>Bills and charges are paused until it is paid.</Text>
      </View>
      <View style={styles.cta}>
        <Text style={styles.ctaText}>Pay</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF1D6',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFE2A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {color: '#6B4200', fontSize: 14, fontWeight: '700'},
  sub: {color: '#8A5A12', fontSize: 12, marginTop: 2},
  cta: {
    backgroundColor: Brand.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  ctaText: {color: '#fff', fontSize: 13, fontWeight: 'bold'},
});
