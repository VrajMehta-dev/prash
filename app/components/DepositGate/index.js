import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Platform, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';
import {startCheckout} from '@utils/checkout';
import {tap} from '@utils/haptics';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

// Shown instead of a screen while the outlet's security deposit is unpaid: nothing else can be done
// for the outlet until then, so one clear page replaces repeated banners and locked lists.
export default function DepositGate({deposit, navigation}) {
  const shop = useSelector(s => s.auth.shopSelected);
  const pay = () => {
    tap();
    startCheckout({kind: 'deposit', id: deposit?.id, prId: shop?.pr_id, title: 'Security deposit', subtitle: shop?.property_name, amount: deposit?.amount});
  };
  return (
    <View style={styles.screen}>
      <View style={styles.circle}>
        <Icon name="lock-outline" size={44} color="#9A5B00" />
      </View>
      <Text style={styles.title}>Pay the security deposit to get started</Text>
      <Text style={styles.amount}>{money(deposit?.amount)}</Text>
      <Text style={styles.text}>
        {`Rent, extra charges and container charges for ${shop?.property_name || 'this outlet'} unlock as soon as the deposit is paid.`}
      </Text>
      <TouchableOpacity activeOpacity={0.85} onPress={pay} style={styles.cta}>
        <Text style={styles.ctaText}>Pay security deposit</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Have another outlet? Switch it from Home.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F5FA', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingTop: Platform.OS === 'ios' ? 40 : (StatusBar.currentHeight || 24)},
  circle: {width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFF1D6', alignItems: 'center', justifyContent: 'center'},
  title: {color: '#17171C', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 22},
  amount: {color: Brand.primary, fontSize: 40, fontWeight: 'bold', marginTop: 10},
  text: {color: '#7A7A85', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10},
  cta: {alignSelf: 'stretch', marginTop: 26, paddingVertical: 16, borderRadius: 16, backgroundColor: Brand.primary, alignItems: 'center'},
  ctaText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  hint: {color: '#9A9AA5', fontSize: 12, marginTop: 14},
});
