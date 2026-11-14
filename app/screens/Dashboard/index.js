/* eslint-disable react-native/no-inline-styles */
import {apiGet} from '@utils/authedApi';
import {useSecurityDeposit} from '@utils/useSecurityDeposit';
import {logout} from '@utils/commonFunction';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
  StatusBar,
  RefreshControl,
  Image,
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {LineChart} from 'react-native-gifted-charts';

import {useSelector} from 'react-redux';
import * as Animatable from 'react-native-animatable';
import BaseSetting from '@config/setting';
import ShopSelector from '@components/SelectShop';
import authActions from '@redux/reducers/auth/actions';
import {store} from '@redux/store/configureStore';
import _, {isEmpty} from 'lodash';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import DueRow from '@components/DueRow';
import FestivalMark, {MOTIFS} from '@components/FestivalMark';
import {useFestival} from '@utils/useFestival';
import {useHeaderTop} from '@components/ScreenHeader';
import {usePaymentQueue, dueRowProps} from '@utils/usePaymentQueue';
import {startCheckout, checkPaymentStatus} from '@utils/checkout';
import {Brand} from '@config/brand';
import {tap} from '@utils/haptics';
const DashboardScreen = ({navigation}) => {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const {setShopSelected, setAccessToken} = authActions;

  const {userData, shopSelected} = useSelector(state => state.auth);
  const {accessToken} = useSelector(state => state.auth);

  const [shopList, setShopList] = useState([]);
  const [dashboardList, setDashboardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [shopsLoaded, setShopsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {data: deposit} = useSecurityDeposit();
  const queue = usePaymentQueue();
  const heroTop = useHeaderTop();
  const festival = useFestival();
  const isFocused = useIsFocused();

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
      fetchDashboardData();
    }, [shopSelected]),
  );

  // Keep the outlet the client is in. Only when the saved outlet is no longer theirs do we
  // reselect: a single outlet is chosen silently, several ask once.
  useEffect(() => {
    // Signed out (logout clears the saved outlet while this screen is still mounted underneath Profile): never ask to pick one.
    if (!accessToken) {
      setIsBottomSheetVisible(false);
      return;
    }
    if (!shopsLoaded || !Array.isArray(shopList)) {
      return;
    }
    const stillTheirs =
      shopSelected?.pr_id &&
      shopList.some(shop => shop.pr_id === shopSelected.pr_id);
    if (stillTheirs) {
      return;
    }
    if (shopList.length === 1) {
      store.dispatch(setShopSelected(shopList[0]));
      setIsBottomSheetVisible(false);
    } else if (shopList.length > 1) {
      if (!isEmpty(shopSelected)) {
        store.dispatch(setShopSelected({}));
      }
      // only while Home is the screen in front: the picker must not pop up over Profile or another tab
      setIsBottomSheetVisible(isFocused);
    } else if (!isEmpty(shopSelected)) {
      store.dispatch(setShopSelected({}));
    }
  }, [shopList, shopSelected, shopsLoaded, accessToken, isFocused]);

  const fetchData = async () => {
    const url = BaseSetting.baseUrl + BaseSetting.endpoints.getAllShops;
    console.log('URL:', url);

    const headers = {
      // 'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };
    console.log('headers', headers);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('Raw Response:', response);

      // ✅ Handle empty response case
      const text = await response.text(); // Read response as text
      const data = text ? JSON.parse(text) : {}; // Parse if not empty
      console.log('dataxxxx', data);

      if (response.ok) {
        console.log('Response Data:', data);
        setShopList(data);
        setShopsLoaded(true);
      } else {
        console.log('Error:');
        // Expired tokens are refreshed (or the session is ended) by utils/session; only a
        // missing token needs handling here.
        if (isEmpty(accessToken)) {
          logout(undefined, true);
        }
      }

      console.log('Response Data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  // The yearly figure is the current FINANCIAL year (1 Apr - 31 Mar). The server sends it as `graph_fy`; older servers only
  // send the calendar year in `graph`.
  const FY_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const fyRows = dashboardList?.graph_fy || dashboardList?.graph || [];
  const lineData = FY_MONTHS.map(month => {
    const found = fyRows.find(entry => entry.month?.startsWith(month));
    return {value: found ? parseFloat(found.payment_amount) : 0, label: month.charAt(0), month};
  });
  const fyLabel = dashboardList?.fy_label || '';

  const fetchDashboardData = async () => {
    // Do not fetch dashboard data without a selected shop
    if (!shopSelected?.pr_id) {
      setLoading(false);
      return;
    }
    const url =
      BaseSetting.baseUrl +
      `${BaseSetting.endpoints.dashboardList}/${shopSelected?.pr_id}`;
    console.log('URL:', url);

    const headers = {
      // 'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };
    console.log('headers', headers);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('Raw Response:', response);

      // ✅ Handle empty response case
      const text = await response.text(); // Read response as text
      const data = text ? JSON.parse(text) : {}; // Parse if not empty
      console.log('data23456', data);

      if (response.ok) {
        setDashboardList(data);
        setLoadError(false);
      } else {
        setLoadError(true);
      }

      console.log('Response Data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };
  const dues = queue.items || [];
  const totalDue = dues.reduce((sum, d) => sum + Number(d?.amount || 0), 0);
  const yearTotal = lineData.reduce((sum, b) => sum + (b.value || 0), 0);
  const multiOutlet = Array.isArray(shopList) && shopList.length > 1;
  const noOutlet = shopsLoaded && Array.isArray(shopList) && shopList.length === 0;
  const showError = loadError && !loading && !noOutlet;
  const allClear = !loading && !loadError && !noOutlet && !!queue.items && dues.length === 0;
  const refresh = async () => {
    tap();
    setRefreshing(true);
    await Promise.all([
      fetchData(),
      fetchDashboardData(),
      queue.reload(),
    ]);
    setRefreshing(false);
  };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const money = n => '\u20B9' + Number(n || 0).toLocaleString('en-IN');
  const go = (screen, params) => {
    tap();
    navigation.navigate(screen, params);
  };
  const actions = [
    {label: 'Rent', icon: 'receipt-outline', onPress: () => go('Bills')},
    {label: 'Extras', icon: 'layers-outline', onPress: () => go('Charges')},
    {label: 'Deposit', icon: 'shield-checkmark-outline', badge: deposit?.locked ? 1 : 0, onPress: () => go('SecurityDeposit')},
    {label: 'Pay', icon: 'wallet-outline', onPress: () => go('Pay')},
  ];

  return (
    <>
      {isFocused && (
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
      )}
      {isFocused && <View pointerEvents="none" style={styles.scrim} />}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#fff"
            colors={[Brand.primary]}
            progressViewOffset={heroTop}
          />
        }
        contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
        {/* Hero: brand gradient that runs under the status bar */}
        <LinearGradient
          colors={[Brand.gradientTop, Brand.gradientBottom]}
          style={[styles.hero, {paddingTop: heroTop}]}>
          {/* one tidy row: who you are + alerts, then the two things you can act on (outlet, festival tag) */}
          <View style={styles.topBar}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Profile"
              activeOpacity={0.8}
              onPress={() => go('Profile')}
              style={styles.avatarBtn}>
              {userData?.profile_photo_url ? (
                <Image source={{uri: userData.profile_photo_url}} style={styles.avatarPhoto} />
              ) : (
                <Text style={styles.avatarInitials}>
                  {`${userData?.first_name?.charAt(0) || ''}${userData?.last_name?.charAt(0) || ''}`.toUpperCase() || '?'}
                </Text>
              )}
            </TouchableOpacity>
            <View style={styles.headText}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {userData?.first_name || 'there'}
              </Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <TouchableOpacity
              activeOpacity={multiOutlet ? 0.8 : 1}
              disabled={!multiOutlet}
              onPress={() => {
                tap();
                setIsBottomSheetVisible(true);
                fetchData();
              }}
              style={[styles.outletChip, !multiOutlet && {paddingRight: 12}]}>
              <Icon name="storefront-outline" size={16} color="#fff" />
              <Text style={styles.outletText} numberOfLines={1}>
                {shopSelected?.property_name || 'Select an outlet'}
              </Text>
              {multiOutlet && <Icon name="chevron-down" size={18} color="#fff" />}
            </TouchableOpacity>
            {!!festival && MOTIFS[festival.key] && (
              <View style={styles.festivalPill}>
                <FestivalMark name={festival.key} size={16} />
                <Text style={styles.festivalText} numberOfLines={1}>{festival.greeting}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Total due: loading / no outlet / error / all clear / amount due */}
          {loading ? (
            <View style={styles.dueCard}>
              <Skeleton w={90} h={14} />
              <Skeleton w={190} h={40} style={{marginTop: 14}} />
              <Skeleton w="85%" h={12} style={{marginTop: 14}} />
              <Skeleton w="100%" h={50} r={16} style={{marginTop: 22}} />
            </View>
          ) : noOutlet ? (
            <Animatable.View animation="fadeInUp" duration={450} style={[styles.dueCard, styles.center]}>
              <View style={[styles.bigCircle, {backgroundColor: '#F6EEF2'}]}>
                <Icon name="storefront-outline" size={36} color={Brand.primary} />
              </View>
              <Text style={styles.stateTitle}>No outlet linked yet</Text>
              <Text style={styles.stateText}>
                Your outlet will show up here as soon as it is linked to your account. Need it sooner? Our team can help.
              </Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => go('HelpAndSupport')} style={[styles.cta, styles.ctaFull]}>
                <Text style={styles.ctaText}>Contact support</Text>
              </TouchableOpacity>
            </Animatable.View>
          ) : showError ? (
            <Animatable.View animation="fadeInUp" duration={450} style={[styles.dueCard, styles.center]}>
              <View style={[styles.bigCircle, {backgroundColor: '#FFF1D6'}]}>
                <Icon name="cloud-alert" size={36} color="#9A5B00" />
              </View>
              <Text style={styles.stateTitle}>Couldn't load your dues</Text>
              <Text style={styles.stateText}>Check your connection and try again.</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => { tap(); setLoading(true); fetchDashboardData(); }} style={[styles.cta, styles.ctaFull]}>
                <Text style={styles.ctaText}>Try again</Text>
              </TouchableOpacity>
            </Animatable.View>
          ) : allClear ? (
            <Animatable.View animation="fadeInUp" duration={450} style={[styles.dueCard, styles.center]}>
              <Animatable.View animation="bounceIn" delay={250} duration={900} style={[styles.bigCircle, {backgroundColor: '#DDF5E7'}]}>
                <Icon name="check-bold" size={38} color="#1E7B4B" />
              </Animatable.View>
              <Text style={styles.stateTitle}>You're all caught up</Text>
              <Text style={styles.stateText}>
                No dues right now. We'll let you know the moment a new bill arrives.
              </Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => go('Bills')} style={[styles.cta, styles.ctaGhost, styles.ctaFull]}>
                <Text style={[styles.ctaText, {color: Brand.primary}]}>View rent history</Text>
                <Icon name="arrow-right" size={20} color={Brand.primary} />
              </TouchableOpacity>
            </Animatable.View>
          ) : (
            <Animatable.View animation="fadeInUp" duration={450} style={styles.dueCard}>
              <View style={styles.dueTop}>
                <Text style={styles.dueLabel}>Total due</Text>
                <View style={[styles.chip, styles.chipWarn]}>
                  <Icon name="clock-alert-outline" size={14} color="#9A5B00" />
                  <Text style={[styles.chipText, {color: '#9A5B00'}]}>
                    {`${dues.length} pending ${dues.length === 1 ? 'item' : 'items'}`}
                  </Text>
                </View>
              </View>
              <Text style={styles.dueAmount}>{money(totalDue)}</Text>
              <Text style={styles.dueHint}>
                Clear your dues on time to keep your outlet running smoothly.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  tap();
                  const props = dueRowProps(dues[0], queue.pr_id);
                  if (props.pending) {
                    checkPaymentStatus(props.checkout);   // a payment is still being confirmed: re-check, never start a second one
                  } else {
                    startCheckout(props.checkout);
                  }
                }}
                style={styles.cta}>
                <Text style={styles.ctaText} numberOfLines={1}>
                  {dues[0]?.payment_pending ? 'Payment being confirmed: tap to check' : dues[0] ? `Pay ${dues[0].title}` : 'Pay now'}
                </Text>
                <Icon name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>
            </Animatable.View>
          )}

          {!!dashboardList?.note && !deposit?.locked && (
            <Animatable.View animation="fadeInUp" delay={80} duration={450} style={styles.note}>
              <Icon name="alert-circle-outline" size={20} color="#9A5B00" />
              <Text style={styles.noteText}>{dashboardList.note}</Text>
            </Animatable.View>
          )}

          {/* Quick actions (hidden while the outlet is locked behind its deposit) */}
          {!deposit?.locked && <Animatable.View animation="fadeInUp" delay={120} duration={450} style={styles.actions}>
            {actions.map(a => (
              <TouchableOpacity
                key={a.label}
                activeOpacity={0.8}
                onPress={a.onPress}
                style={styles.action}>
                <View style={styles.actionIcon}>
                  <IonIcon name={a.icon} size={24} color={Brand.primary} />
                  {a.badge > 0 && (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>{a.badge > 9 ? '9+' : a.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </Animatable.View>}

          {/* Dues, in the order they must be paid */}
          {dues.length > 0 && !deposit?.locked && (
            <Animatable.View animation="fadeInUp" delay={180} duration={450}>
              <Text style={styles.sectionTitle}>Pay in this order</Text>
              {dues.map(d => (
                <DueRow
                  key={`${d.type}-${d.id}`}
                  navigation={navigation}
                  {...dueRowProps(d, queue.pr_id)}
                />
              ))}
            </Animatable.View>
          )}

          {/* Payments this year */}
          {!noOutlet && !showError && !loading && !deposit?.locked && (
          <Animatable.View animation="fadeInUp" delay={260} duration={450} style={styles.card}>
            <View style={styles.cardHead}>
              <View>
                <Text style={styles.cardTitle}>{fyLabel ? `FY ${fyLabel}` : 'This financial year'}</Text>
                <Text style={styles.cardSub}>Total billed</Text>
              </View>
              <Text style={styles.cardFigure}>{money(yearTotal)}</Text>
            </View>
            {yearTotal > 0 ? (
              // tap a point to see that month in a toast (the figure at the top stays the whole financial year)
              <View>
                <LineChart
                  data={lineData}
                  height={150}
                  spacing={CHART_SLOT}
                  initialSpacing={8}
                  endSpacing={4}
                  disableScroll
                  curved
                  areaChart
                  color="#632240"
                  thickness={3}
                  startFillColor="#632240"
                  endFillColor="#632240"
                  startOpacity={0.18}
                  endOpacity={0.02}
                  dataPointsColor="#632240"
                  dataPointsRadius={5}
                  onPress={(item) => {
                    tap();
                    if (item?.value > 0) {
                      Toast.show({text2: item.month + ' : ' + money(item.value), type: 'info'});
                    }
                  }}
                  noOfSections={4}
                  yAxisThickness={0}
                  xAxisColor="#E6E6EC"
                  rulesColor="#EFEFF4"
                  yAxisTextStyle={{color: '#9A9AA5', fontSize: 10}}
                  xAxisLabelTextStyle={{color: '#7A7A85', fontSize: 11, textAlign: 'center'}}
                  formatYLabel={v => {
                    const n = Number(v);
                    return n >= 1000 ? `${Math.round(n / 100) / 10}k` : `${Math.round(n)}`;
                  }}
                  yAxisLabelWidth={34}
                  isAnimated
                />
              </View>
            ) : (
              <View style={styles.empty}>
                <Icon name="chart-box-outline" size={36} color="#C9C9D2" />
                <Text style={styles.emptyText}>Your yearly billing will show up here.</Text>
              </View>
            )}
          </Animatable.View>
          )}
        </View>
      </ScrollView>
      <ShopSelector
        shops={shopList}
        selectedId={shopSelected?.pr_id}
        isVisible={isBottomSheetVisible}
        onSelect={t => {
          store.dispatch(setShopSelected(t));
          setTimeout(() => {
            setIsBottomSheetVisible(false);
          }, 200);
        }}
        onClose={() => setIsBottomSheetVisible(false)}
      />
    </>
  );
};

// 12 bars must fit inside the card (screen - page padding - card padding - y labels)
const CHART_INNER = Dimensions.get('window').width - 32 - 36 - 34 - 8;
const CHART_SLOT = CHART_INNER / 12;

const Skeleton = ({w = '100%', h = 14, r = 8, style}) => (
  <Animatable.View
    animation={{0: {opacity: 0.45}, 0.5: {opacity: 1}, 1: {opacity: 0.45}}}
    iterationCount="infinite"
    duration={1100}
    useNativeDriver
    style={[{width: w, height: h, borderRadius: r, backgroundColor: '#E9E9F0'}, style]}
  />
);

const STATUS_H = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;
const HERO_TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 14;
const SHADOW = {
  shadowColor: '#1B1230',
  shadowOffset: {width: 0, height: 6},
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F5FA'},
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: STATUS_H,
    backgroundColor: Brand.gradientTop,
    zIndex: 10,
  },
  hero: {
    paddingTop: HERO_TOP,
    paddingHorizontal: 20,
    paddingBottom: 92,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topBar: {flexDirection: 'row', alignItems: 'center', gap: 12},
  headText: {flex: 1},
  chipsRow: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 16},
  festivalPill: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 20, backgroundColor: 'rgba(255,210,122,0.16)'},
  avatarBtn: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', overflow: 'hidden'},
  avatarPhoto: {width: '100%', height: '100%'},
  avatarInitials: {color: '#fff', fontSize: 16, fontWeight: '700'},
  heroRow: {flexDirection: 'row', alignItems: 'flex-start'},
  greeting: {color: 'rgba(255,255,255,0.75)', fontSize: 13},
  festivalRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2},
  festivalText: {color: '#FFD27A', fontSize: 12, fontWeight: '700'},
  name: {color: '#fff', fontSize: 22, fontWeight: 'bold'},
  outletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    maxWidth: '100%',
    flexShrink: 1,
    gap: 6,
  },
  outletText: {color: '#fff', fontSize: 13, fontWeight: '600', flexShrink: 1},
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFD166',
    borderWidth: 1.5,
    borderColor: Brand.gradientBottom,
  },
  body: {marginTop: -68, paddingHorizontal: 16},
  dueCard: {backgroundColor: '#fff', borderRadius: 24, padding: 20, ...SHADOW},
  dueTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  dueLabel: {color: '#6B6B76', fontSize: 14, fontWeight: '600'},
  chip: {flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14},
  chipWarn: {backgroundColor: '#FFF1D6'},
  chipOk: {backgroundColor: '#DDF5E7'},
  chipText: {fontSize: 12, fontWeight: '700'},
  dueAmount: {color: '#17171C', fontSize: 38, fontWeight: 'bold', marginTop: 8},
  dueHint: {color: '#7A7A85', fontSize: 13, lineHeight: 19, marginTop: 6},
  cta: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: Brand.primary,
  },
  ctaGhost: {backgroundColor: '#F6EEF2'},
  ctaText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  note: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFF6E3',
  },
  noteText: {flex: 1, color: '#7A4A00', fontSize: 13, lineHeight: 19},
  actions: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 20},
  action: {flex: 1, alignItems: 'center'},
  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  actionLabel: {marginTop: 8, color: '#3A3A44', fontSize: 12, fontWeight: '600'},
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeText: {color: '#fff', fontSize: 10, fontWeight: 'bold'},
  sectionTitle: {color: '#17171C', fontSize: 17, fontWeight: 'bold', marginTop: 26, marginBottom: 12},
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    ...SHADOW,
  },
  billIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F6EEF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  billMonth: {color: '#17171C', fontSize: 15, fontWeight: '700'},
  billSub: {color: '#8A8A95', fontSize: 12, marginTop: 2},
  billAmount: {color: '#17171C', fontSize: 16, fontWeight: 'bold'},
  card: {backgroundColor: '#fff', borderRadius: 22, padding: 18, marginTop: 18, ...SHADOW},
  cardHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14},
  cardTitle: {color: '#17171C', fontSize: 16, fontWeight: 'bold'},
  cardSub: {color: '#8A8A95', fontSize: 12, marginTop: 2},
  cardFigure: {color: Brand.primary, fontSize: 15, fontWeight: 'bold'},
  progressTrack: {height: 10, borderRadius: 5, backgroundColor: '#F0E4EA', marginTop: 14, overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: 5, backgroundColor: Brand.primary},
  progressRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 10},
  progressText: {color: '#6B6B76', fontSize: 13, fontWeight: '600'},
  center: {alignItems: 'center'},
  bigCircle: {width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginTop: 4},
  stateTitle: {color: '#17171C', fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center'},
  stateText: {color: '#7A7A85', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center', paddingHorizontal: 6},
  ctaFull: {alignSelf: 'stretch'},
  empty: {alignItems: 'center', paddingVertical: 26, gap: 8},
  emptyText: {color: '#9A9AA5', fontSize: 13},
});

export default DashboardScreen;
