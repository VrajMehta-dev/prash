import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import moment from 'moment';
import {Brand} from '@config/brand';
import ScreenHeader from '@components/ScreenHeader';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';
import {useSecurityDeposit} from '@utils/useSecurityDeposit';
import {startCheckout} from '@utils/checkout';
import {onPaymentChange} from '@utils/paymentEvents';
import {downloadPdf} from '@utils/downloadPdf';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 10;

export default function SecurityDeposit({navigation}) {
  const shop = useSelector(s => s.auth.shopSelected);
  const {loading, data, reload} = useSecurityDeposit();
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const watching = useRef(false);

  const status = data?.status || 'none';

  // After the payment sheet closes the webhook can take a few seconds: poll until it flips to paid.
  useEffect(() => {
    if (!watching.current || status !== 'pending') {
      return;
    }
    let tries = 0;
    const t = setInterval(() => {
      tries += 1;
      reload();
      if (tries >= 8) {
        clearInterval(t);
      }
    }, 3000);
    return () => clearInterval(t);
  }, [status, data]);

  const refresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  useEffect(() => onPaymentChange(reload), [reload]);

  const pay = () =>
    startCheckout({kind: 'deposit', id: data?.id, prId: shop?.pr_id, title: 'Security deposit', subtitle: shop?.property_name, amount: data?.amount});

  return (
    <View style={styles.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[Brand.primary]} />
        }
        contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
        <ScreenHeader title="Security deposit" subtitle={shop?.property_name} overlap />

        <View style={styles.body}>
          {loading ? (
            <View style={[styles.card, {alignItems: 'center', paddingVertical: 50}]}>
              <ActivityIndicator color={Brand.primary} />
            </View>
          ) : status === 'pending' ? (
            <View style={styles.card}>
              <View style={[styles.chip, {backgroundColor: '#FFF1D6'}]}>
                <Icon name="clock-alert-outline" size={14} color="#9A5B00" />
                <Text style={[styles.chipText, {color: '#9A5B00'}]}>Payment due</Text>
              </View>
              <Text style={styles.amount}>{money(data.amount)}</Text>
              <Text style={styles.text}>
                A security deposit is required for this outlet.
              </Text>

              <View style={styles.lockBox}>
                <Icon name="lock-outline" size={18} color="#6B4200" />
                <View style={{flex: 1}}>
                  <Text style={styles.lockTitle}>Paused until it is paid</Text>
                  <Text style={styles.lockText}>
                    Bill payments, additional charges and container charges for this outlet.
                  </Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.85} disabled={paying} onPress={pay} style={styles.cta}>
                {paying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="shield-lock-outline" size={20} color="#fff" />
                    <Text style={styles.ctaText}>Pay {money(data.amount)}</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={refresh} style={styles.linkBtn}>
                <Text style={styles.link}>Already paid? Refresh status</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => downloadPdf(`client/security-deposit/invoice/${shop?.pr_id}`, `security-deposit-invoice.pdf`)} style={styles.linkBtn}>
                <Text style={styles.link}>Download invoice</Text>
              </TouchableOpacity>
            </View>
          ) : status === 'paid' ? (
            <View style={[styles.card, styles.center]}>
              <View style={[styles.circle, {backgroundColor: '#DDF5E7'}]}>
                <Icon name="check-bold" size={38} color="#1E7B4B" />
              </View>
              <Text style={styles.stateTitle}>Security deposit paid</Text>
              <Text style={styles.amountSmall}>{money(data.amount)}</Text>
              <Text style={styles.text}>
                {data.payment_date
                  ? `Paid on ${moment(data.payment_date).format('DD MMM YYYY')} ${
                      data.payment_from === 'app' ? 'online' : 'at the office'
                    }`
                  : 'Your deposit is on record.'}
                {data.ref_no ? `\nRef: ${data.ref_no}` : ''}
              </Text>
              <View style={styles.docRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.docBtn, {backgroundColor: Brand.primary}]}
                  onPress={() => downloadPdf(`client/security-deposit/receipt/${shop?.pr_id}`, `security-deposit-receipt.pdf`)}>
                  <Icon name="download" size={18} color="#fff" />
                  <Text style={styles.docBtnText}>Receipt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.docBtn, {borderWidth: 1, borderColor: Brand.primary}]}
                  onPress={() => downloadPdf(`client/security-deposit/invoice/${shop?.pr_id}`, `security-deposit-invoice.pdf`)}>
                  <Icon name="file-document-outline" size={18} color={Brand.primary} />
                  <Text style={[styles.docBtnText, {color: Brand.primary}]}>Invoice</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.card, styles.center]}>
              <View style={[styles.circle, {backgroundColor: '#F6EEF2'}]}>
                <Icon name="shield-check-outline" size={38} color={Brand.primary} />
              </View>
              <Text style={styles.stateTitle}>No deposit required</Text>
              <Text style={styles.text}>
                There is no security deposit to pay for this outlet right now.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F5FA'},
  hero: {paddingTop: TOP, paddingHorizontal: 20, paddingBottom: 80, borderBottomLeftRadius: 30, borderBottomRightRadius: 30},
  back: {width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center'},
  heroTitle: {color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 16},
  heroSub: {color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2},
  body: {marginTop: -56, paddingHorizontal: 16},
  card: {backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#1B1230', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3},
  center: {alignItems: 'center'},
  chip: {flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14},
  chipText: {fontSize: 12, fontWeight: '700'},
  amount: {color: '#17171C', fontSize: 40, fontWeight: 'bold', marginTop: 10},
  amountSmall: {color: '#17171C', fontSize: 26, fontWeight: 'bold', marginTop: 6},
  text: {color: '#7A7A85', fontSize: 14, lineHeight: 21, marginTop: 6, textAlign: 'left'},
  lockBox: {flexDirection: 'row', gap: 10, marginTop: 16, padding: 14, borderRadius: 16, backgroundColor: '#FFF6E3'},
  lockTitle: {color: '#6B4200', fontSize: 14, fontWeight: '700'},
  lockText: {color: '#8A5A12', fontSize: 12, lineHeight: 18, marginTop: 2},
  cta: {marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 16, backgroundColor: Brand.primary},
  ctaText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  docRow: {flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 18},
  docBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 14},
  docBtnText: {color: '#fff', fontSize: 15, fontWeight: '700'},
  linkBtn: {alignItems: 'center', marginTop: 14},
  link: {color: Brand.primary, fontSize: 13, fontWeight: '600'},
  circle: {width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginTop: 4},
  stateTitle: {color: '#17171C', fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center'},
});
