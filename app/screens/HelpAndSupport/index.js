import React from 'react';
import {View, Text, StyleSheet, ScrollView, Linking, Platform, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';
import ScreenHeader from '@components/ScreenHeader';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';
import {tap} from '@utils/haptics';
import {openWebsite} from '@utils/openWebsite';

const TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 10;
const CONTACT = {
  name: 'Shubhamkumar Shah',
  role: 'PU Food Court',
  phone: '+916202781773',
  phoneLabel: '+91 6202 781 773',
  email: 'foodcourt.pu@paruluniversity.ac.in',
};

// tel: opens the dialer, mailto: opens the mail app; say so if the phone has none.
const open = (url, what) =>
  Linking.openURL(url).catch(() =>
    Toast.show({type: 'error', text1: `No ${what} app found`, text2: 'Please use the details shown on this page.'}),
  );

const Card = ({icon, title, value, sub, action, onPress}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => {
      tap();
      onPress();
    }}
    style={styles.card}>
    <View style={styles.iconBox}>
      <Icon name={icon} size={24} color={Brand.primary} />
    </View>
    <View style={{flex: 1}}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue} numberOfLines={1}>{value}</Text>
      {!!sub && <Text style={styles.cardSub}>{sub}</Text>}
    </View>
    <View style={styles.pill}>
      <Text style={styles.pillText}>{action}</Text>
    </View>
  </TouchableOpacity>
);

export default function HelpAndSupport({navigation}) {
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 32}}>
        <ScreenHeader title="Help & Support" subtitle="Questions about rent, bills or payments? Reach us here." overlap onBack={() => navigation.navigate('Profile')} />

        <View style={styles.body}>
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Icon name="clock-outline" size={24} color={Brand.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.cardTitle}>Support hours</Text>
              <Text style={styles.cardValue}>9:30 AM to 4:30 PM</Text>
              <Text style={styles.cardSub}>Monday to Saturday. No support on University holidays.</Text>
            </View>
          </View>
          <Card
            icon="phone-outline"
            title="Call us"
            value={CONTACT.phoneLabel}
            sub={`${CONTACT.name}, ${CONTACT.role}`}
            action="Call"
            onPress={() => open(`tel:${CONTACT.phone}`, 'phone')}
          />
          <Card
            icon="email-outline"
            title="Email us"
            value={CONTACT.email}
                        action="Email"
            onPress={() => open(`mailto:${CONTACT.email}?subject=PRASH%20support`, 'email')}
          />
          <Card
            icon="information-outline"
            title="About PRASH"
            value="Learn more about the product"
            action="Open"
            onPress={() => openWebsite('https://aystera.com/products/prash-rent-management', 'help_about_prash')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F5FA'},
  hero: {paddingTop: TOP, paddingHorizontal: 20, paddingBottom: 64, borderBottomLeftRadius: 30, borderBottomRightRadius: 30},
  back: {width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center'},
  heroTitle: {color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 16},
  heroSub: {color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4, lineHeight: 20},
  body: {marginTop: -48, paddingHorizontal: 16, gap: 12},
  card: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 22, padding: 16, shadowColor: '#1B1230', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3},
  iconBox: {width: 48, height: 48, borderRadius: 16, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  cardTitle: {color: '#8A8A95', fontSize: 12, fontWeight: '600'},
  cardValue: {color: '#17171C', fontSize: 15, fontWeight: '700', marginTop: 2},
  cardSub: {color: '#8A8A95', fontSize: 12, marginTop: 2},
  pill: {paddingVertical: 8, paddingHorizontal: 16, borderRadius: 18, backgroundColor: Brand.primary},
  pillText: {color: '#fff', fontSize: 13, fontWeight: '800'},
});
