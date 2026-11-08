import React from 'react';
import {View, Text, StyleSheet, ScrollView, Linking, Platform, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';
import {tap} from '@utils/haptics';

const TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 10;
const CONTACT = {
  name: 'Shubhamkumar Shah',
  role: 'PU Food Court',
  phone: '+916202781773',
  phoneLabel: '+91 6202 781 773',
  email: 'foodcourt.pu@paruluniversity.ac.in',
};

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
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
        <LinearGradient colors={[Brand.gradientTop, Brand.gradientBottom]} style={styles.hero}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Icon name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Help & Support</Text>
          <Text style={styles.heroSub}>Questions about your rent, bills or payments? Reach us here.</Text>
        </LinearGradient>

        <View style={styles.body}>
          <Card
            icon="phone-outline"
            title="Call us"
            value={CONTACT.phoneLabel}
            sub={`${CONTACT.name}, ${CONTACT.role}`}
            action="Call"
            onPress={() => Linking.openURL(`tel:${CONTACT.phone}`)}
          />
          <Card
            icon="email-outline"
            title="Email us"
            value={CONTACT.email}
            sub="We reply on working days"
            action="Email"
            onPress={() => Linking.openURL(`mailto:${CONTACT.email}`)}
          />
          <Card
            icon="information-outline"
            title="About PRASH"
            value="Learn more about the product"
            action="Open"
            onPress={() => Linking.openURL('https://aystera.com/products/prash-rent-management')}
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
  body: {marginTop: -36, paddingHorizontal: 16, gap: 12},
  card: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 22, padding: 16, shadowColor: '#1B1230', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3},
  iconBox: {width: 48, height: 48, borderRadius: 16, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  cardTitle: {color: '#8A8A95', fontSize: 12, fontWeight: '600'},
  cardValue: {color: '#17171C', fontSize: 15, fontWeight: '700', marginTop: 2},
  cardSub: {color: '#8A8A95', fontSize: 12, marginTop: 2},
  pill: {paddingVertical: 8, paddingHorizontal: 16, borderRadius: 18, backgroundColor: Brand.primary},
  pillText: {color: '#fff', fontSize: 13, fontWeight: '800'},
});
