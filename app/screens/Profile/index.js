import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {openWebsite} from '@utils/openWebsite';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import TouchableOpacity from '@components/PressableScale';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';
import BaseSetting from '@config/setting';
import {Brand} from '@config/brand';
import {useHeaderTop} from '@components/ScreenHeader';
import {logout} from '@utils/commonFunction';
import {useSecurityDeposit} from '@utils/useSecurityDeposit';
import {useUnreadCount} from '@utils/useUnreadCount';
import authActions from '@redux/reducers/auth/actions';
import {store} from '@redux/store/configureStore';

const TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 14;

const show = v => {
  const s = String(v ?? '').trim();
  return !s || /^(unknown|not available)$/i.test(s) ? null : s;
};

const Group = ({title, action, children}) => (
  <View style={styles.groupWrap}>
    {!!title && (
      <View style={styles.groupHead}>
        <Text style={styles.groupTitle}>{title}</Text>
        {action}
      </View>
    )}
    <View style={styles.group}>{children}</View>
  </View>
);

// One row: icon, title, optional value/subtitle, optional badge/chip, chevron when it opens something.
const Row = ({icon, title, value, onPress, badge, chip, last, danger}) => {
  const body = (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <View style={[styles.rowIcon, danger && {backgroundColor: '#FBE4E1'}]}>
        <Icon name={icon} size={20} color={danger ? '#C0392B' : Brand.primary} />
      </View>
      <View style={{flex: 1}}>
        <Text style={[styles.rowTitle, danger && {color: '#C0392B'}]}>{title}</Text>
        {value !== undefined && value !== null && (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        )}
      </View>
      {!!chip && (
        <View style={[styles.chip, chip.warn ? styles.chipWarn : styles.chipOk]}>
          <Text style={[styles.chipText, {color: chip.warn ? '#9A5B00' : '#1E7B4B'}]}>{chip.text}</Text>
        </View>
      )}
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
      {!!onPress && !danger && <Icon name="chevron-right" size={22} color="#B5B5BD" />}
    </View>
  );
  return onPress ? (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      {body}
    </TouchableOpacity>
  ) : (
    body
  );
};

const ProfileScreen = ({navigation}) => {
  const top = useHeaderTop();
  const {userData, accessToken, shopSelected} = useSelector(state => ({
    userData: state.auth.userData,
    accessToken: state.auth.accessToken,
    shopSelected: state.auth.shopSelected,
  }));
  const [loggingOut, setLoggingOut] = useState(false);
  const isFocused = useIsFocused();
  const {data: deposit} = useSecurityDeposit();
  const unread = useUnreadCount();
  const {setUserData} = authActions;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(BaseSetting.baseUrl + BaseSetting.endpoints.userInfo, {
        method: 'GET',
        headers: {Accept: '*/*', Authorization: 'Bearer ' + accessToken},
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (response.ok) {
        store.dispatch(setUserData(data));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const logOut = async () => {
    setLoggingOut(true);
    try {
      await logout(userData); // server push-token cleanup + FCM delete + local reset
    } finally {
      setLoggingOut(false);
    }
  };

  // Google sign-in keeps the tenant's Google photo up to date on the server; fall back to initials if it won't load.
  const photoUrl = userData?.profile_photo_url;
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => {
    setPhotoFailed(false);
  }, [photoUrl]);
  // Is the installed app the newest release? (null until the server answers, or if it can't be reached)
  const [isLatest, setIsLatest] = useState(null);
  const [latestBuild, setLatestBuild] = useState('');
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(BaseSetting.baseUrl + 'client/app-version');
        const j = await res.json();
        const l = j?.[Platform.OS === 'ios' ? 'ios' : 'android'];
        if (!alive || !l) return;
        const mine = String(DeviceInfo.getVersion()).split('.').map(n => parseInt(n, 10) || 0);
        const theirs = String(l.latest_version).split('.').map(n => parseInt(n, 10) || 0);
        let d = 0;
        for (let i = 0; i < Math.max(mine.length, theirs.length) && !d; i++) {
          d = (mine[i] || 0) - (theirs[i] || 0);
        }
        const build = parseInt(DeviceInfo.getBuildNumber(), 10) || 0;
        setIsLatest(d > 0 || (d === 0 && build >= l.latest_build));
        setLatestBuild(`${l.latest_version} (${l.latest_build})`);
      } catch (e) {}
    })();
    return () => {
      alive = false;
    };
  }, []);
  const initials = `${userData?.first_name?.charAt(0) || ''}${userData?.last_name?.charAt(0) || ''}`.toUpperCase();

  return (
    <View style={styles.screen}>
      {isFocused && <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
        <LinearGradient colors={[Brand.gradientTop, Brand.gradientBottom]} style={[styles.hero, {paddingTop: top}]}>
          <View style={styles.avatar}>
            {photoUrl && !photoFailed ? (
              <Image source={{uri: photoUrl}} style={styles.avatarImg} onError={() => setPhotoFailed(true)} />
            ) : (
              <Text style={styles.avatarText}>{initials || '?'}</Text>
            )}
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {`${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || 'Your account'}
          </Text>
          <Text style={styles.email} numberOfLines={1}>{userData?.email || ''}</Text>
          {!!shopSelected?.property_name && (
            <View style={styles.outletChip}>
              <Icon name="storefront-outline" size={14} color="#fff" />
              <Text style={styles.outletText} numberOfLines={1}>{shopSelected.property_name}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.body}>
          <Group title="Payments & alerts">
            <Row
              icon={deposit?.locked ? 'lock-outline' : 'shield-check-outline'}
              title="Security Deposit"
              value={deposit?.locked ? 'Payment due' : deposit?.has_deposit ? 'Paid' : 'Not required'}
              chip={deposit?.locked ? {text: 'DUE', warn: true} : deposit?.has_deposit ? {text: 'PAID'} : null}
              onPress={() => navigation.navigate('SecurityDeposit')}
            />
            <Row
              icon="bell-outline"
              title="Notifications"
              value={unread > 0 ? `${unread} unread` : 'All caught up'}
              badge={unread}
              onPress={() => navigation.navigate('NotificationScreen')}
              last
            />
          </Group>

          <Group title="Shop">
            <Row icon="file-sign" title="Shop documents" value="Rental contract, FSSAI licence" onPress={() => navigation.navigate('PropertyDocuments')} last />
          </Group>

          <Group title="Personal details">
            <Row icon="phone-outline" title="Phone" value={userData?.phone ? String(userData.phone) : 'Not added'} />
            <Row icon="email-outline" title="Email" value={userData?.email || 'Not added'} />
            <Row
              icon="calendar-check-outline"
              title="Member since"
              value={userData?.created_at ? moment(userData.created_at).format('MMMM YYYY') : '-'}
              last
            />
          </Group>

          <Group title="Bank account">
            <Row icon="bank-outline" title="Account number" value={show(userData?.bank_account_num) || 'Not added'} />
            <Row icon="bank-transfer" title="IFSC code" value={userData?.ifsc_code || 'Not added'} last />
          </Group>

          <Group title="Documents">
            <Row icon="card-account-details-outline" title="Aadhar" value={show(userData?.aadhar_num) || 'Not added'} />
            <Row icon="card-text-outline" title="PAN" value={show(userData?.pan_num) || 'Not added'} />
            <Row icon="file-certificate-outline" title="GST certificate" value={show(userData?.gst_num) || 'Not added'} />
            <Row icon="file-document-outline" title="TAN" value={show(userData?.tan_num) || 'Not added'} last />
          </Group>

          <Group title="Help">
            <Row icon="lifebuoy" title="Help & Support" onPress={() => navigation.navigate('HelpAndSupport')} last />
          </Group>

          <Group>
            <TouchableOpacity activeOpacity={0.85} onPress={logOut} disabled={loggingOut}>
              <View style={styles.row}>
                <View style={[styles.rowIcon, {backgroundColor: '#FBE4E1'}]}>
                  {loggingOut ? (
                    <ActivityIndicator size="small" color="#C0392B" />
                  ) : (
                    <Icon name="logout" size={20} color="#C0392B" />
                  )}
                </View>
                <Text style={[styles.rowTitle, {color: '#C0392B', flex: 1}]}>Log out</Text>
              </View>
            </TouchableOpacity>
          </Group>

          <View style={styles.footer}>
            <Text style={styles.footerLogo}>PRASH</Text>
            <Text style={styles.footerVersion}>
              v{DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
              {isLatest === true ? ' \u00B7 Latest' : isLatest === false ? ` \u00B7 Update available (${latestBuild})` : ''}
            </Text>
            <Text style={styles.footerLine}>Built and managed by</Text>
            <Text
              accessibilityRole="link"
              onPress={() => openWebsite('https://aystera.com/', 'profile_footer')}
              style={styles.footerBrand}>
              Aystera Software Solutions LLP
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const SHADOW = {shadowColor: '#1B1230', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2};
const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F5FA'},
  hero: {alignItems: 'center', paddingTop: TOP, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30},
  avatar: {width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center'},
  avatarImg: {width: 72, height: 72, borderRadius: 36},
  avatarText: {color: '#fff', fontSize: 28, fontWeight: 'bold'},
  name: {color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 12},
  email: {color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2},
  outletChip: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', maxWidth: '90%'},
  outletText: {color: '#fff', fontSize: 12, fontWeight: '600', flexShrink: 1},
  body: {paddingHorizontal: 16, paddingTop: 6},
  groupWrap: {marginTop: 18},
  groupHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, marginBottom: 8},
  groupTitle: {color: '#6B6B76', fontSize: 13, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase'},
  group: {backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', ...SHADOW},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14},
  rowDivider: {borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: '#EEEEF3'},
  rowIcon: {width: 36, height: 36, borderRadius: 12, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  rowTitle: {color: '#17171C', fontSize: 15, fontWeight: '600'},
  rowValue: {color: '#8A8A95', fontSize: 13, marginTop: 2},
  chip: {paddingVertical: 3, paddingHorizontal: 9, borderRadius: 10},
  chipWarn: {backgroundColor: '#FFF1D6'},
  chipOk: {backgroundColor: '#DDF5E7'},
  chipText: {fontSize: 10, fontWeight: '800'},
  badge: {minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center'},
  badgeText: {color: '#fff', fontSize: 11, fontWeight: 'bold'},
  footer: {alignItems: 'flex-start', paddingTop: 26, paddingBottom: 12, paddingHorizontal: 6},
  footerLogo: {fontFamily: 'Inter-Bold', fontSize: 24, letterSpacing: 3, color: '#B5B5BD'},
  footerVersion: {fontSize: 12, color: '#9A9AA5', marginTop: 2},
  footerLine: {fontSize: 12, color: '#9A9AA5', marginTop: 14},
  footerBrand: {fontSize: 12, color: '#9A9AA5', marginTop: 1, fontWeight: 'bold', textDecorationLine: 'underline'},
});

export default ProfileScreen;
