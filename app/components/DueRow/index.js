import React, {useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';
import {startCheckout, checkPaymentStatus} from '@utils/checkout';
import {tap} from '@utils/haptics';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

// One unpaid item with an inline Pay button: opens the payment sheet directly (no detour through
// Rent/Extras/Containers). `checkout` describes the item for the Review & pay sheet.
export default function DueRow({icon, title, sub, amount, checkout, blockedBy, pending, highlight, style}) {
  const [checking, setChecking] = useState(false);
  const pay = async () => {
    if (blockedBy || checking) return;
    tap();
    if (!pending) {
      startCheckout(checkout);
      return;
    }
    // a payment for this item is still being confirmed: re-check it here instead of opening a second payment
    setChecking(true);
    const state = await checkPaymentStatus(checkout).catch(() => 'pending');
    setChecking(false);
    if (state === 'paid') {
      Toast.show({type: 'success', text1: 'Payment confirmed', text2: title});
    } else if (state === 'failed') {
      Toast.show({type: 'info', text1: 'Payment did not go through', text2: 'You can pay again.'});
    } else {
      Toast.show({type: 'info', text1: 'Still being confirmed', text2: 'We will keep checking. Please do not pay again yet.'});
    }
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
        {!blockedBy && !!pending && (
          <View style={styles.pendingChip}>
            <Icon name="time-outline" size={13} color="#9A5B00" />
            <Text style={styles.pendingText}>Payment being confirmed</Text>
          </View>
        )}
        <Text style={styles.amount}>{money(amount)}</Text>
      </View>
      <TouchableOpacity activeOpacity={0.85} disabled={!!blockedBy} onPress={pay} style={[styles.pay, !!blockedBy && styles.payLocked]}>
        {blockedBy ? (
          <Icon name="lock-closed-outline" size={18} color="#8A8A95" />
        ) : checking ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.payText}>{pending ? 'Check' : 'Pay'}</Text>
        )}
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
  pendingChip: {flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#FFF1D6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4},
  pendingText: {color: '#9A5B00', fontSize: 12, fontWeight: '700'},
  blockedNote: {color: '#9A5B00', fontSize: 12, fontWeight: '600', marginTop: 3},
  payLocked: {backgroundColor: '#ECECF1'},
  pay: {minWidth: 72, height: 40, paddingHorizontal: 18, borderRadius: 20, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center'},
  payText: {color: '#fff', fontSize: 14, fontWeight: '800'},
});
