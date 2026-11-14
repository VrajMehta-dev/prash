import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  StatusBar,
  ActivityIndicator,
  Linking,
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import {Brand} from '@config/brand';
import ScreenHeader from '@components/ScreenHeader';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';
import {apiGet} from '@utils/authedApi';

const TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 10;
const fmt = d => (d ? moment(d, 'YYYY-MM-DD').format('DD MMM YYYY') : '-');

// active / expiring (30 days or less) / expired, from the server's days_left
const statusOf = days => {
  if (days === null || days === undefined) return null;
  if (days < 0) return {text: 'EXPIRED', bg: '#FBE4E1', fg: '#C0392B', note: `Expired ${-days} day${days === -1 ? '' : 's'} ago`};
  if (days <= 30) return {text: 'EXPIRING', bg: '#FFF1D6', fg: '#9A5B00', note: days === 0 ? 'Expires today' : `Expires in ${days} day${days === 1 ? '' : 's'}`};
  return {text: 'ACTIVE', bg: '#DDF5E7', fg: '#1E7B4B', note: `${days} days left`};
};

function DocCard({icon, title, subtitle, days, fields, onOpen, hasFile}) {
  const [busy, setBusy] = useState(false);
  const st = statusOf(days);
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Icon name={icon} size={24} color={Brand.primary} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text>}
        </View>
        {!!st && (
          <View style={[styles.chip, {backgroundColor: st.bg}]}>
            <Text style={[styles.chipText, {color: st.fg}]}>{st.text}</Text>
          </View>
        )}
      </View>
      <View style={styles.grid}>
        {fields.map(f => (
          <View key={f.label} style={styles.cell}>
            <Text style={styles.cellLabel}>{f.label}</Text>
            <Text style={styles.cellValue}>{f.value}</Text>
          </View>
        ))}
      </View>
      {!!st && <Text style={[styles.note, {color: st.fg}]}>{st.note}</Text>}
      {hasFile && (
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await onOpen();
            } finally {
              setBusy(false);
            }
          }}
          style={styles.cta}>
          {busy ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="file-eye-outline" size={18} color="#fff" />}
          <Text style={styles.ctaText}>View document</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// One list screen, two views: mode 'contracts' (rental contracts) or 'compliance' (FSSAI licence and other compliance documents).
export default function PropertyDocuments({navigation, mode = 'contracts'}) {
  const isContracts = mode === 'contracts';
  const shop = useSelector(s => s.auth.shopSelected);
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!shop?.pr_id) {
      setData({contracts: [], fssai: null});
      return;
    }
    try {
      const r = await apiGet(`client/documents/${shop.pr_id}`);
      if (r.ok) {
        setData(r.data);
        setFailed(false);
      } else {
        setFailed(true);
      }
    } catch (e) {
      setFailed(true);
    }
  }, [shop?.pr_id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const open = async path => {
    const r = await apiGet(path);
    if (r.ok && r.data?.signedUrl) {
      Linking.openURL(r.data.signedUrl).catch(() =>
        Toast.show({type: 'error', text1: 'Could not open the document'}),
      );
    } else {
      Toast.show({type: 'error', text1: 'Document', text2: r.data?.msg || 'Could not open the document'});
    }
  };

  const contracts = isContracts ? data?.contracts || [] : [];
  const fssai = isContracts ? null : data?.fssai;
  const empty = data && !contracts.length && !fssai;

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
              await load();
              setRefreshing(false);
            }}
          />
        }
        contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
        <ScreenHeader title={isContracts ? 'Contracts' : 'Compliance'} subtitle={shop?.property_name} overlap />

        <View style={styles.body}>
          {!data && !failed && <ActivityIndicator color={Brand.primary} style={{marginTop: 40}} />}
          {failed && (
            <View style={styles.card}>
              <Text style={styles.title}>Could not load documents</Text>
              <Text style={styles.sub}>Check your connection and pull down to retry.</Text>
            </View>
          )}
          {empty && (
            <View style={styles.card}>
              <Text style={styles.title}>{isContracts ? 'No contracts yet' : 'No compliance documents yet'}</Text>
              <Text style={styles.sub}>
                {isContracts
                  ? 'Your rental contracts will appear here once they are added.'
                  : 'Your FSSAI licence and other compliance documents will appear here once they are added.'}
              </Text>
            </View>
          )}

          {contracts.map((c, i) => (
            <DocCard
              key={c.cd_id}
              icon="file-sign"
              title={i === 0 ? 'Rental contract' : 'Previous rental contract'}
              subtitle={`${fmt(c.start_date)} to ${fmt(c.end_date)}`}
              days={i === 0 ? c.days_left : null}
              hasFile={c.has_file}
              fields={[
                {label: 'Starts', value: fmt(c.start_date)},
                {label: 'Ends', value: fmt(c.end_date)},
              ]}
              onOpen={() => open(`client/documents/${shop.pr_id}/contract/link?cd_id=${c.cd_id}`)}
            />
          ))}

          {!!fssai && (
            <DocCard
              icon="shield-check-outline"
              title="FSSAI licence"
              subtitle={fssai.license_num ? `No. ${fssai.license_num}` : undefined}
              days={fssai.days_left}
              hasFile={fssai.has_file}
              fields={[
                {label: 'Licence no.', value: fssai.license_num || '-'},
                {label: 'Issued', value: fmt(fssai.issuance_date)},
                {label: 'Expires', value: fmt(fssai.expiry_date)},
              ]}
              onOpen={() => open(`client/documents/${shop.pr_id}/fssai/link`)}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F5FA'},
  hero: {paddingTop: TOP, paddingHorizontal: 20, paddingBottom: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30},
  back: {width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center'},
  heroTitle: {color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 16},
  heroSub: {color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2},
  body: {marginTop: -48, paddingHorizontal: 16},
  card: {backgroundColor: '#fff', borderRadius: 24, padding: 18, marginBottom: 14, shadowColor: '#1B1230', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3},
  top: {flexDirection: 'row', alignItems: 'center', gap: 12},
  iconBox: {width: 46, height: 46, borderRadius: 15, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  title: {color: '#17171C', fontSize: 16, fontWeight: '700'},
  sub: {color: '#8A8A95', fontSize: 13, marginTop: 2},
  chip: {paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12},
  chipText: {fontSize: 11, fontWeight: '800'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 14},
  cell: {minWidth: '40%'},
  cellLabel: {color: '#8A8A95', fontSize: 12},
  cellValue: {color: '#17171C', fontSize: 14, fontWeight: '600', marginTop: 2},
  note: {fontSize: 13, fontWeight: '600', marginTop: 14},
  cta: {marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 16, backgroundColor: Brand.primary},
  ctaText: {color: '#fff', fontSize: 15, fontWeight: 'bold'},
});
