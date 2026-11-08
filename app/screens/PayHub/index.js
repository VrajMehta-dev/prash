import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import {Brand} from '@config/brand';
import ScreenHeader from '@components/ScreenHeader';
import {useSecurityDeposit} from '@utils/useSecurityDeposit';
import {usePaymentQueue, dueRowProps} from '@utils/usePaymentQueue';
import DueRow from '@components/DueRow';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 14;

// "Payments": everything owed, in the order it must be paid (the server enforces the same order):
// security deposit > container charges > extra charges > rent, oldest first. Only the first can be paid.
export default function PayHub({navigation}) {
  const shop = useSelector(s => s.auth.shopSelected);
  const isFocused = useIsFocused();
  const {reload: reloadDeposit} = useSecurityDeposit();
  const {items, pr_id, reload} = usePaymentQueue();
  const [refreshing, setRefreshing] = useState(false);
  const total = (items || []).reduce((t, i) => t + Number(i.amount || 0), 0);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={[Brand.primary]}
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([reload(), reloadDeposit()]);
              setRefreshing(false);
            }}
          />
        }
        contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
        <ScreenHeader title="Payments" subtitle={shop?.property_name} overlap />

        <View style={styles.body}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalAmount}>{items ? money(total) : '...'}</Text>
            <Text style={styles.totalHint}>
              {!items
                ? ' '
                : items.length > 0
                ? 'Dues are paid in order: deposit, container charges, extra charges, then rent (oldest first).'
                : "You're all caught up. Nothing to pay right now."}
            </Text>
          </View>

          <View style={{marginTop: 18}}>
            {!items ? (
              <Text style={styles.empty}>...</Text>
            ) : items.length === 0 ? (
              <View style={styles.emptyRow}>
                <Icon name="check-circle-outline" size={20} color="#1E7B4B" />
                <Text style={styles.emptyText}>Nothing pending</Text>
              </View>
            ) : (
              items.map(it => (
                <DueRow
                  key={`${it.type}-${it.id}`}
                  navigation={navigation}
                  {...dueRowProps(it, pr_id)}
                />
              ))
            )}
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
