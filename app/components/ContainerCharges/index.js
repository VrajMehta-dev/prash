import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import {Brand} from '@config/brand';
import {apiGet} from '@utils/authedApi';
import {startPayment} from '@utils/startPayment';
import {usePaymentQueue} from '@utils/usePaymentQueue';
import {TabSelector} from '@components/BillBoard';
import ScreenHeader from '@components/ScreenHeader';
import {downloadPdf} from '@utils/downloadPdf';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

function ChargeCard({charge, navigation, blockedBy}) {
  const paid = charge.status === 'paid';
  const [busy, setBusy] = useState(false);
  const id = charge.container_charge_id;
  // Title/description are clamped (1 and 2 lines). Hidden unclamped copies tell us if anything is cut off.
  const [expanded, setExpanded] = useState(false);
  const [titleCut, setTitleCut] = useState(false);
  const [descCut, setDescCut] = useState(false);
  const cut = titleCut || descCut;
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Icon name="package-variant-closed" size={22} color={Brand.primary} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.title} numberOfLines={expanded ? undefined : 1}>{charge.title}</Text>
          {!!charge.description && (
            <Text style={styles.desc} numberOfLines={expanded ? undefined : 2}>{charge.description}</Text>
          )}
          {/* invisible, unclamped copies used only to detect truncation */}
          <Text
            style={[styles.title, styles.measure]}
            onTextLayout={e => setTitleCut(e.nativeEvent.lines.length > 1)}>
            {charge.title}
          </Text>
          {!!charge.description && (
            <Text
              style={[styles.desc, styles.measure]}
              onTextLayout={e => setDescCut(e.nativeEvent.lines.length > 2)}>
              {charge.description}
            </Text>
          )}
          {cut && (
            <TouchableOpacity onPress={() => setExpanded(v => !v)} hitSlop={8} style={styles.moreBtn}>
              <Text style={styles.more}>{expanded ? 'Show less' : 'Read more'}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.date}>Added {moment(charge.created_at).format('DD MMM YYYY')}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.amount}>{money(charge.payment_amount)}</Text>
          <View style={[styles.chip, paid ? styles.chipPaid : styles.chipDue]}>
            <Text style={[styles.chipText, {color: paid ? '#1E7B4B' : '#9A5B00'}]}>
              {paid ? 'PAID' : 'DUE'}
            </Text>
          </View>
        </View>
      </View>
      {!paid && !!blockedBy && (
        <Text style={{color: '#9A5B00', fontSize: 12, fontWeight: '600', marginTop: 10}}>{`Pay "${blockedBy}" first`}</Text>
      )}
      <View style={styles.actions}>
        {!paid && (
          <TouchableOpacity
            disabled={busy || !!blockedBy}
            style={[styles.btn, styles.btnPrimary, !!blockedBy && {backgroundColor: '#ECECF1'}]}
            onPress={async () => {
              setBusy(true);
              await startPayment(navigation, `client/container-charges/initiate-payment/${id}`);
              setBusy(false);
            }}>
            <Icon name={blockedBy ? 'lock-outline' : 'credit-card-outline'} size={18} color={blockedBy ? '#8A8A95' : '#fff'} />
            <Text style={[styles.btnPrimaryText, !!blockedBy && {color: '#8A8A95'}]}>{blockedBy ? 'Locked' : 'Pay now'}</Text>
          </TouchableOpacity>
        )}
        {paid && (
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, {backgroundColor: '#2E9E65'}]}
            onPress={() => downloadPdf(`client/container-charges/receipt/${id}`, `receipt-${id}.pdf`)}>
            <Icon name="download" size={18} color="#fff" />
            <Text style={styles.btnPrimaryText}>Receipt</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={() => downloadPdf(`client/container-charges/invoice/${id}`, `invoice-${id}.pdf`)}>
          <Icon name="file-document-outline" size={18} color={Brand.primary} />
          <Text style={styles.btnGhostText}>Invoice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ContainerCharges({navigation}) {
  const prId = useSelector(s => s.auth.shopSelected?.pr_id);
  const queue = usePaymentQueue();
  const [list, setList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!prId) {
      setList([]);
      return;
    }
    try {
      const r = await apiGet(`client/container-charges/${prId}`);
      setList(r.ok ? r.data?.data || [] : []);
    } catch (e) {
      setList([]);
    }
  }, [prId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const [activeTab, setActiveTab] = useState('pending');
  const shop = useSelector(s => s.auth.shopSelected);
  const shown = (list || [])
    .filter(c => (activeTab === 'pending' ? c.status !== 'paid' : c.status === 'paid'))
    .sort((a, b) => (activeTab === 'pending' ? a.container_charge_id - b.container_charge_id : b.container_charge_id - a.container_charge_id));

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: '#fff'}}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          colors={[Brand.primary]}
          onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
        />
      }
      contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
      <ScreenHeader title="Container Charges" subtitle={shop?.property_name} />
      <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
      <View style={{paddingHorizontal: 16}}>
        {list === null ? (
          <View style={styles.skel}><View style={styles.skelBar} /><View style={[styles.skelBar, {width: '60%'}]} /></View>
        ) : shown.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="package-variant" size={44} color="#C9C9D2" />
            <Text style={styles.emptyTitle}>{activeTab === 'pending' ? 'No pending charges' : 'No paid charges yet'}</Text>
            <Text style={styles.emptyText}>Charges for containers issued to your outlet will appear here.</Text>
          </View>
        ) : (
          shown.map(c => (
            <ChargeCard
              key={c.container_charge_id}
              charge={c}
              navigation={navigation}
              blockedBy={c.status !== 'paid' ? queue.blockedOf('container_charge', c.container_charge_id) : undefined}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const SHADOW = {shadowColor: '#1B1230', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2};
const styles = StyleSheet.create({
  header: {padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f3f5'},
  headerTitle: {fontSize: 24, fontWeight: '700', color: '#2d3436', marginBottom: 4},
  headerSubtitle: {fontSize: 14, color: '#6c757d'},
  section: {color: '#17171C', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 10},
  card: {backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 12, ...SHADOW},
  top: {flexDirection: 'row', gap: 12, alignItems: 'flex-start'},
  iconBox: {width: 44, height: 44, borderRadius: 14, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  title: {color: '#17171C', fontSize: 15, fontWeight: '700'},
  desc: {color: '#7A7A85', fontSize: 12, marginTop: 2},
  date: {color: '#A0A0AB', fontSize: 11, marginTop: 4},
  measure: {position: 'absolute', left: 0, right: 0, opacity: 0},
  moreBtn: {alignSelf: 'flex-start', marginTop: 4},
  more: {color: Brand.primary, fontSize: 12, fontWeight: '700'},
  amount: {color: '#17171C', fontSize: 17, fontWeight: 'bold'},
  chip: {marginTop: 6, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 10},
  chipDue: {backgroundColor: '#FFF1D6'},
  chipPaid: {backgroundColor: '#DDF5E7'},
  chipText: {fontSize: 10, fontWeight: '800'},
  actions: {flexDirection: 'row', gap: 10, marginTop: 14},
  btn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12},
  btnPrimary: {flex: 1.5, backgroundColor: Brand.primary},
  btnPrimaryText: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  btnGhost: {borderWidth: 1, borderColor: Brand.primary},
  btnGhostText: {color: Brand.primary, fontSize: 14, fontWeight: '600'},
  empty: {alignItems: 'center', paddingVertical: 60, gap: 8},
  emptyTitle: {color: '#17171C', fontSize: 17, fontWeight: 'bold', marginTop: 6},
  emptyText: {color: '#8A8A95', fontSize: 13, textAlign: 'center', paddingHorizontal: 30},
  skel: {backgroundColor: '#fff', borderRadius: 20, padding: 18, gap: 12, ...SHADOW},
  skelBar: {height: 14, borderRadius: 7, backgroundColor: '#ECECF2', width: '90%'},
});
