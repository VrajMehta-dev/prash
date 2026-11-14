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
import {BillCard} from '@components/BillBoard';
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
  const watching = useRef(false);

  const status = data?.status || 'none';
  const deposits = data?.deposits || [];
  // An outlet can hold several deposits (a first one, then top-ups). The oldest unpaid one is the one that can be paid now.
  const firstPending = deposits.find(d => d.status === 'pending');
  const ordered = [...deposits.filter(d => d.status === 'pending'), ...deposits.filter(d => d.status === 'paid').reverse()];

  // After the payment sheet closes the webhook can take a few seconds: poll until it flips to paid.
  useEffect(() => {
    if (!watching.current || !firstPending) {
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

  const pdf = (kind, d) =>
    downloadPdf(`client/security-deposit/${kind}/${shop?.pr_id}?id=${d.id}`, `security-deposit-${kind}-${d.id}.pdf`);
  const via = d => (d.payment_from === 'app' ? 'online' : 'at the office');

  return (
    <View style={styles.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[Brand.primary]} />}
        contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
        <ScreenHeader title="Security deposit" subtitle={shop?.property_name} />

        <View style={styles.list}>
          {loading ? (
            <View style={[styles.card, {alignItems: 'center', paddingVertical: 50, marginHorizontal: 16}]}>
              <ActivityIndicator color={Brand.primary} />
            </View>
          ) : deposits.length === 0 ? (
            <View style={[styles.card, styles.center, {marginHorizontal: 16}]}>
              <View style={[styles.circle, {backgroundColor: '#F6EEF2'}]}>
                <Icon name="shield-check-outline" size={38} color={Brand.primary} />
              </View>
              <Text style={styles.stateTitle}>No deposit required</Text>
              <Text style={styles.text}>There is no security deposit to pay for this outlet right now.</Text>
            </View>
          ) : (
            <>
              {data.locked && (
                <View style={styles.lockBox}>
                  <Icon name="lock-outline" size={18} color="#6B4200" />
                  <View style={{flex: 1}}>
                    <Text style={styles.lockTitle}>Paused until the deposit is paid</Text>
                    <Text style={styles.lockText}>Rent, extra charges and container charges for this outlet.</Text>
                  </View>
                </View>
              )}

              {/* what the deposit holds: collected, drawn against dues, left */}
              {data.collected > 0 && (
                <View style={[styles.card, styles.summary]}>
                  <View style={styles.sumCol}>
                    <Text style={styles.sumLabel}>Collected</Text>
                    <Text style={styles.sumValue}>{money(data.collected)}</Text>
                  </View>
                  {data.settled_total > 0 && (
                    <View style={styles.sumCol}>
                      <Text style={styles.sumLabel}>Deducted</Text>
                      <Text style={[styles.sumValue, {color: '#C0392B'}]}>{money(data.settled_total)}</Text>
                    </View>
                  )}
                  <View style={styles.sumCol}>
                    <Text style={styles.sumLabel}>Balance</Text>
                    <Text style={[styles.sumValue, {color: '#1E7B4B'}]}>{money(data.remaining)}</Text>
                  </View>
                </View>
              )}

              <View style={{paddingHorizontal: 16}}>
              {ordered.map((d, i) => {
                const paid = d.status === 'paid';
                const blockedBy = !paid && firstPending && firstPending.id !== d.id ? 'the earlier deposit' : undefined;
                return (
                  <BillCard
                    key={d.id}
                    bill={{bill_id: d.id, status: paid ? 'paid' : 'pending', payment_amount: d.amount, rounded_amount: 0}}
                    title={deposits.length > 1 ? `Security deposit ${deposits.findIndex(x => x.id === d.id) + 1}` : 'Security deposit'}
                    subtitle={
                      paid
                        ? d.payment_date
                          ? `Paid on ${moment(d.payment_date).format('DD MMM YYYY')} ${via(d)}`
                          : 'On record'
                        : 'A security deposit is required for this outlet.'
                    }
                    rows={[
                      {label: 'Deposit amount', value: money(d.amount)},
                      ...(paid && d.payment_date ? [{label: 'Received on', value: moment(d.payment_date).format('DD MMM YYYY')}] : []),
                      ...(paid && d.ref_no ? [{label: 'Reference', value: String(d.ref_no)}] : []),
                    ]}
                    blockedBy={blockedBy}
                    isLast={i === ordered.length - 1 && !(data.ledger?.length > 1)}
                    onPayNow={() => {
                      watching.current = true;
                      startCheckout({kind: 'deposit', id: d.id, prId: shop?.pr_id, title: 'Security deposit', subtitle: shop?.property_name, amount: d.amount});
                    }}
                    onDownloadReceipt={() => pdf('receipt', d)}
                    onDownloadInvoice={() => pdf('invoice', d)}
                  />
                );
              })}
              </View>

              {/* history: deposits collected and amounts deducted for rent / extra charges, with what was left each time */}
              {(data.ledger?.length || 0) > 1 && (
                <View style={[styles.card, {marginTop: 4, marginBottom: 16, marginHorizontal: 16}]}>
                  <Text style={styles.listTitle}>Deposit history</Text>
                  {data.ledger.map((e, i) => (
                    <View key={i} style={[styles.depRow, i > 0 && styles.depRowBorder]}>
                      <View style={{flex: 1}}>
                        <Text style={styles.depAmount}>
                          {e.kind === 'deposit'
                            ? 'Deposit collected'
                            : e.kind === 'requested'
                            ? 'Deposit requested'
                            : `Deducted for ${
                                e.bill_id
                                  ? `rent ${e.bill_month ? moment(e.bill_month).format('MMM YYYY') : ''}`.trim()
                                  : e.title || 'an extra charge'
                              }`}
                        </Text>
                        <Text style={styles.depSub}>{moment(e.at).format('DD MMM YYYY')}</Text>
                      </View>
                      <View style={{alignItems: 'flex-end'}}>
                        <Text
                          style={[
                            styles.depAmount,
                            {color: e.kind === 'settlement' ? '#C0392B' : e.kind === 'deposit' ? '#1E7B4B' : '#7A7A85'},
                          ]}>
                          {e.kind === 'settlement' ? '-' : e.kind === 'deposit' ? '+' : ''}
                          {money(e.amount)}
                        </Text>
                        {e.balance_after !== null && e.balance_after !== undefined && (
                          <Text style={styles.depSub}>Balance {money(e.balance_after)}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {paddingHorizontal: 0, paddingTop: 16, paddingBottom: 8},
  summary: {flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 4, marginBottom: 16},
  sumCol: {flex: 1},
  sumLabel: {color: '#7A7A85', fontSize: 12, fontWeight: '600'},
  sumValue: {color: '#17171C', fontSize: 17, fontWeight: 'bold', marginTop: 4},
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
  lockBox: {flexDirection: 'row', gap: 10, marginTop: 4, marginHorizontal: 16, marginBottom: 14, padding: 14, borderRadius: 16, backgroundColor: '#FFF6E3'},
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
  listTitle: {color: '#17171C', fontSize: 16, fontWeight: 'bold', marginBottom: 6},
  depRow: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12},
  depRowBorder: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E6E6EC'},
  depAmount: {color: '#17171C', fontSize: 16, fontWeight: '700'},
  depSub: {color: '#7A7A85', fontSize: 12, marginTop: 3},
  depBtn: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: Brand.primary},
  depBtnText: {color: Brand.primary, fontSize: 13, fontWeight: '700'},
  stateTitle: {color: '#17171C', fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center'},
});
