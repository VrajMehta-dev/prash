import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Platform, StatusBar} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import AdditionalCharges from '@screens/AdditionalCharges';
import ContainerCharges from '@components/ContainerCharges';
import DepositBanner from '@components/DepositBanner';
import {useSecurityDeposit} from '@utils/useSecurityDeposit';
import {Brand} from '@config/brand';

const TOP = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 6;
const SEGMENTS = [
  {key: 'additional', label: 'Additional'},
  {key: 'container', label: 'Container'},
];

// Charges tab: Additional charges (existing screen) and Container charges, plus the deposit lock banner.
export default function Charges(props) {
  const {navigation, route} = props;
  const [segment, setSegment] = useState(route?.params?.segment || 'additional');
  const {data: deposit} = useSecurityDeposit();
  useEffect(() => {
    if (route?.params?.segment) {
      setSegment(route.params.segment);
    }
  }, [route?.params?.segment]);

  return (
    <View style={styles.screen}>
      <View style={styles.bar}>
        <View style={styles.seg}>
          {SEGMENTS.map(s => {
            const active = segment === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => setSegment(s.key)}
                style={[styles.segBtn, active && styles.segActive]}>
                <Text style={[styles.segText, active && styles.segTextActive]}>{s.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <DepositBanner deposit={deposit} onPress={() => navigation.navigate('SecurityDeposit')} style={{marginBottom: 4}} />
      <View style={{flex: 1}}>
        {segment === 'additional' ? (
          <AdditionalCharges {...props} />
        ) : (
          <ContainerCharges navigation={navigation} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#fff'},
  bar: {paddingTop: TOP, paddingHorizontal: 16, paddingBottom: 6, backgroundColor: '#fff'},
  seg: {flexDirection: 'row', backgroundColor: '#F1F1F5', borderRadius: 16, padding: 4},
  segBtn: {flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12},
  segActive: {backgroundColor: Brand.primary},
  segText: {color: '#6B6B76', fontSize: 14, fontWeight: '600'},
  segTextActive: {color: '#fff'},
});
