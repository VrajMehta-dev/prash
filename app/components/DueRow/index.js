import React, {useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';
import {startPayment} from '@utils/startPayment';
import {tap} from '@utils/haptics';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

// One unpaid item with an inline Pay button: opens the payment sheet directly (no detour through
// Rent/Extras/Containers). `payPath` is the initiate-payment API path for this item.
export default function DueRow({navigation, icon, title, sub, amount, payPath, highlight, style}) {
  const [busy, setBusy] = useState(false);
  const pay = async () => {
    if (busy) return;
    tap();
    setBusy(true);
    try {
      await startPayment(navigation, payPath);
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={[styles.row, highlight && styles.highlight, style]}>
      <View style={[styles.iconBox, highlight && {backgroundColor: '#FFE2A8'}]}>
        <Icon name={icon} size={22} color={highlight ? '#9A5B00' : Brand.primary} />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {!!sub && <Text style={styles.sub} numberOfLines={1}>{sub}</Text>}
        <Text style={styles.amount}>{money(amount)}</Text>
      </View>
      <TouchableOpacity activeOpacity={0.85} disabled={busy} onPress={pay} style={styles.pay}>
        {busy ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.payText}>Pay</Text>}
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
  pay: {minWidth: 72, height: 40, paddingHorizontal: 18, borderRadius: 20, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center'},
  payText: {color: '#fff', fontSize: 14, fontWeight: '800'},
});
