import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';
import {startCheckout} from '@utils/checkout';
import {tap} from '@utils/haptics';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

// One unpaid item with an inline Pay button: opens the payment sheet directly (no detour through
// Rent/Extras/Containers). `checkout` describes the item for the Review & pay sheet.
export default function DueRow({icon, title, sub, amount, checkout, blockedBy, highlight, style}) {
  const pay = () => {
    if (blockedBy) return;
    tap();
    startCheckout(checkout);
  };
  return (
    <View style={[styles.row, highlight && styles.highlight, !!blockedBy && styles.blocked, style]}>
      <View style={[styles.iconBox, highlight && {backgroundColor: '#FFE2A8'}]}>
        <Icon name={icon} size={22} color={highlight ? '#9A5B00' : Brand.primary} />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {!!sub && <Text style={styles.sub} numberOfLines={1}>{sub}</Text>}
        {!!blockedBy && <Text style={styles.blockedNote} numberOfLines={2}>{`Pay "${blockedBy}" first`}</Text>}
        <Text style={styles.amount}>{money(amount)}</Text>
      </View>
      <TouchableOpacity activeOpacity={0.85} disabled={!!blockedBy} onPress={pay} style={[styles.pay, !!blockedBy && styles.payLocked]}>
        {blockedBy ? <Icon name="lock-closed-outline" size={18} color="#8A8A95" /> : <Text style={styles.payText}>Pay</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 10, shadowColor: '#1B1230', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3},
  highlight: {borderWidth: 1.5, borderColor: '#F0C36A', backgroundColor: '#FFFAF0'},
  iconBox: {width: 44, height: 44, borderRadius: 14, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  title: {color: '#17171C', fontSize: 15, fontWeight: '700'},
  sub: {color: '#8A8A95', fontSize: 12, marginTop: 1},
  amount: {color: '#17171C', fontSize: 16, fontWeight: 'bold', marginTop: 3},
  blocked: {opacity: 0.8},
  blockedNote: {color: '#9A5B00', fontSize: 12, fontWeight: '600', marginTop: 3},
  payLocked: {backgroundColor: '#ECECF1'},
  pay: {minWidth: 72, height: 40, paddingHorizontal: 18, borderRadius: 20, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center'},
  payText: {color: '#fff', fontSize: 14, fontWeight: '800'},
});
