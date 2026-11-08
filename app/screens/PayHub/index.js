import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {Brand} from '@config/brand';
import {apiGet} from '@utils/authedApi';
import {useSecurityDeposit} from '@utils/useSecurityDeposit';
import DepositBanner from '@components/DepositBanner';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 14;
const sum = (rows, key = 'payment_amount') =>
  rows.reduce((t, r) => t + Number(r?.[key] || 0), 0);

// "Payments": everything the tenant can owe, in one place. Each type opens its own screen.
export default function PayHub({navigation}) {
  const shop = useSelector(s => s.auth.shopSelected);
  const isFocused = useIsFocused();
  const {data: deposit, reload: reloadDeposit} = useSecurityDeposit();
  const [dues, setDues] = useState(null); // {rent:{n,total}, extra:{...}, container:{...}}
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!shop?.pr_id) {
      setDues({rent: {n: 0, total: 0}, extra: {n: 0, total: 0}, container: {n: 0, total: 0}});
      return;
    }
    const unpaid = r => (r?.data?.data || []).filter(c => c.status !== 'paid');
    try {
      const [rent, extra, container] = await Promise.all([
        apiGet(`client/dashboard/${shop.pr_id}`),
        apiGet(`client/additional-charges/${shop.pr_id}`),
        apiGet(`client/container-charges/${shop.pr_id}`),
      ]);
      const rentRows = rent.data?.outstandingBills || [];
      const extraRows = unpaid(extra);
      const containerRows = unpaid(container);
      setDues({
        rent: {n: rentRows.length, total: sum(rentRows)},
        extra: {n: extraRows.length, total: sum(extraRows)},
        container: {n: containerRows.length, total: sum(containerRows)},
      });
    } catch (e) {
      setDues(d => d || {rent: {n: 0, total: 0}, extra: {n: 0, total: 0}, container: {n: 0, total: 0}});
    }
  }, [shop?.pr_id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const locked = !!deposit?.locked;
  const depositDue = locked ? Number(deposit?.amount || 0) : 0;
  const total = dues ? dues.rent.total + dues.extra.total + dues.container.total + depositDue : 0;

  const rows = [
    {
      key: 'deposit',
      route: 'SecurityDeposit',
      icon: locked ? 'lock-outline' : 'shield-check-outline',
      title: 'Security Deposit',
      sub: locked ? 'Pay this first to unlock other payments' : deposit?.has_deposit ? 'Paid' : 'Not required',
      amount: locked ? money(deposit.amount) : null,
      chip: locked ? {text: 'DUE', warn: true} : deposit?.has_deposit ? {text: 'PAID', warn: false} : null,
      highlight: locked,
    },
    {
      key: 'rent',
      route: 'Bills',
      icon: 'calendar-month-outline',
      title: 'Monthly Rent',
      sub: dues ? (dues.rent.n ? `${dues.rent.n} unpaid` : 'All paid') : '...',
      amount: dues?.rent.n ? money(dues.rent.total) : null,
      chip: dues && !dues.rent.n ? {text: 'PAID', warn: false} : null,
    },
    {
      key: 'extra',
      route: 'Charges',
      icon: 'plus-circle-outline',
      title: 'Extra Charges',
      sub: dues ? (dues.extra.n ? `${dues.extra.n} pending` : 'Nothing pending') : '...',
      amount: dues?.extra.n ? money(dues.extra.total) : null,
      chip: dues && !dues.extra.n ? {text: 'CLEAR', warn: false} : null,
    },
    {
      key: 'container',
      route: 'Containers',
      icon: 'package-variant-closed',
      title: 'Container Charges',
      sub: dues ? (dues.container.n ? `${dues.container.n} pending` : 'Nothing pending') : '...',
      amount: dues?.container.n ? money(dues.container.total) : null,
      chip: dues && !dues.container.n ? {text: 'CLEAR', warn: false} : null,
    },
  ];
  // While the deposit is unpaid it goes first and is highlighted; otherwise it sinks to the bottom.
  const ordered = locked ? rows : [...rows.slice(1), rows[0]];

  return (
    <View style={styles.screen}>
      {isFocused && <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={[Brand.primary]}
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([load(), reloadDeposit()]);
              setRefreshing(false);
            }}
          />
        }
        contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
        <LinearGradient colors={[Brand.gradientTop, Brand.gradientBottom]} style={styles.hero}>
          <Text style={styles.heroTitle}>Payments</Text>
          <Text style={styles.heroSub} numberOfLines={1}>
            {shop?.property_name || ''}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalAmount}>{dues ? money(total) : '...'}</Text>
            <Text style={styles.totalHint}>
              {!dues
                ? ' '
                : total > 0
                ? 'Open a payment below to pay it. Rent, extra charges and container charges are paid separately.'
                : "You're all caught up. Nothing to pay right now."}
            </Text>
          </View>

          <DepositBanner
            deposit={deposit}
            onPress={() => navigation.navigate('SecurityDeposit')}
            style={{marginHorizontal: 0, marginTop: 14, marginBottom: 0}}
          />

          <View style={{marginTop: 18}}>
            {ordered.map(r => (
              <TouchableOpacity
                key={r.key}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(r.route)}
                style={[styles.row, r.highlight && styles.rowHighlight]}>
                <View style={[styles.iconBox, r.highlight && {backgroundColor: '#FFE2A8'}]}>
                  <Icon name={r.icon} size={24} color={r.highlight ? '#9A5B00' : Brand.primary} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.rowTitle}>{r.title}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{r.sub}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  {!!r.amount && <Text style={styles.rowAmount}>{r.amount}</Text>}
                  {!!r.chip && (
                    <View style={[styles.chip, r.chip.warn ? styles.chipWarn : styles.chipOk]}>
                      <Text style={[styles.chipText, {color: r.chip.warn ? '#9A5B00' : '#1E7B4B'}]}>
                        {r.chip.text}
                      </Text>
                    </View>
                  )}
                </View>
                <Icon name="chevron-right" size={22} color="#B5B5BD" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const SHADOW = {shadowColor: '#1B1230', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3};
const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F5FA'},
  hero: {paddingTop: TOP, paddingHorizontal: 20, paddingBottom: 84, borderBottomLeftRadius: 30, borderBottomRightRadius: 30},
  heroTitle: {color: '#fff', fontSize: 28, fontWeight: 'bold'},
  heroSub: {color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2},
  body: {marginTop: -58, paddingHorizontal: 16},
  totalCard: {backgroundColor: '#fff', borderRadius: 24, padding: 20, ...SHADOW},
  totalLabel: {color: '#6B6B76', fontSize: 14, fontWeight: '600'},
  totalAmount: {color: '#17171C', fontSize: 38, fontWeight: 'bold', marginTop: 6},
  totalHint: {color: '#7A7A85', fontSize: 13, lineHeight: 19, marginTop: 6},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 10, ...SHADOW},
  rowHighlight: {borderWidth: 1.5, borderColor: '#F0C36A', backgroundColor: '#FFFAF0'},
  iconBox: {width: 46, height: 46, borderRadius: 15, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  rowTitle: {color: '#17171C', fontSize: 16, fontWeight: '700'},
  rowSub: {color: '#8A8A95', fontSize: 12, marginTop: 2},
  rowAmount: {color: '#17171C', fontSize: 16, fontWeight: 'bold'},
  chip: {marginTop: 4, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 10},
  chipWarn: {backgroundColor: '#FFF1D6'},
  chipOk: {backgroundColor: '#DDF5E7'},
  chipText: {fontSize: 10, fontWeight: '800'},
});
