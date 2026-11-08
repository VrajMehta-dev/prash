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
import DueRow from '@components/DueRow';
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
  const [dues, setDues] = useState(null); // {rent:{n,total,rows}, extra:{...}, container:{...}}
  const [refreshing, setRefreshing] = useState(false);

  const EMPTY = {rent: {n: 0, total: 0, rows: []}, extra: {n: 0, total: 0, rows: []}, container: {n: 0, total: 0, rows: []}};
  const load = useCallback(async () => {
    if (!shop?.pr_id) {
      setDues(EMPTY);
      return;
    }
    const unpaid = r => (r?.data?.data || []).filter(c => c.status !== 'paid');
    try {
      const [rent, extra, container] = await Promise.all([
        apiGet(`client/dashboard/${shop.pr_id}`),
        apiGet(`client/additional-charges/${shop.pr_id}`),
        apiGet(`client/container-charges/${shop.pr_id}`),
      ]);
      const pack = rows => ({n: rows.length, total: sum(rows), rows});
      setDues({
        rent: pack(rent.data?.outstandingBills || []),
        extra: pack(unpaid(extra)),
        container: pack(unpaid(container)),
      });
    } catch (e) {
      setDues(d => d || EMPTY);
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

  const sections = [
    {
      key: 'rent',
      title: 'Monthly Rent',
      empty: 'All paid',
      icon: 'calendar-month-outline',
      item: r => ({id: r.bill_id, title: r.month || 'Bill', path: `client/bills/initiate-payment/${r.bill_id}`}),
    },
    {
      key: 'extra',
      title: 'Extra Charges',
      empty: 'Nothing pending',
      icon: 'plus-circle-outline',
      item: r => ({id: r.additional_charge_id, title: r.title, path: `client/additional-charges/initiate-payment/${r.additional_charge_id}`}),
    },
    {
      key: 'container',
      title: 'Container Charges',
      empty: 'Nothing pending',
      icon: 'package-variant-closed',
      item: r => ({id: r.container_charge_id, title: r.title, path: `client/container-charges/initiate-payment/${r.container_charge_id}`}),
    },
  ];

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
                ? 'Tap Pay on any item below.'
                : "You're all caught up. Nothing to pay right now."}
            </Text>
          </View>

          {locked && (
            <View style={{marginTop: 18}}>
              <Text style={styles.sectionTitle}>Pay this first</Text>
              <DueRow
                navigation={navigation}
                highlight
                icon="lock-outline"
                title="Security Deposit"
                sub="Unlocks rent and charge payments"
                amount={deposit.amount}
                payPath={`client/security-deposit/initiate-payment/${shop?.pr_id}`}
              />
            </View>
          )}

          {sections.map(sec => {
            const d = dues?.[sec.key];
            return (
              <View key={sec.key} style={{marginTop: 18}}>
                <Text style={styles.sectionTitle}>{sec.title}</Text>
                {!d ? (
                  <Text style={styles.empty}>...</Text>
                ) : d.n === 0 ? (
                  <View style={styles.emptyRow}>
                    <Icon name="check-circle-outline" size={20} color="#1E7B4B" />
                    <Text style={styles.emptyText}>{sec.empty}</Text>
                  </View>
                ) : (
                  d.rows.map(r => {
                    const it = sec.item(r);
                    return (
                      <DueRow
                        key={it.id}
                        navigation={navigation}
                        icon={sec.icon}
                        title={it.title}
                        amount={r.payment_amount}
                        payPath={it.path}
                      />
                    );
                  })
                )}
              </View>
            );
          })}
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
  sectionTitle: {color: '#6B6B76', fontSize: 13, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 4},
  empty: {color: '#8A8A95', paddingHorizontal: 4},
  emptyRow: {flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, padding: 14},
  emptyText: {color: '#1E7B4B', fontWeight: '600'},
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
