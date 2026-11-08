import React from 'react';
import {View, Text, StyleSheet, Platform, StatusBar} from 'react-native';
import ContainerCharges from '@components/ContainerCharges';
import DepositBanner from '@components/DepositBanner';
import {useSecurityDeposit} from '@utils/useSecurityDeposit';

const TOP = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 6;

// Container Charges: its own screen (it used to hide behind a switch on the Charges tab).
export default function Containers({navigation}) {
  const {data: deposit} = useSecurityDeposit();
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Container Charges</Text>
        <Text style={styles.sub}>Charges for containers issued to your outlet</Text>
      </View>
      <DepositBanner
        deposit={deposit}
        onPress={() => navigation.navigate('SecurityDeposit')}
        style={{marginBottom: 4}}
      />
      <View style={{flex: 1}}>
        <ContainerCharges navigation={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#fff'},
  header: {paddingTop: TOP, paddingHorizontal: 20, paddingBottom: 8, backgroundColor: '#fff'},
  title: {fontSize: 26, fontWeight: 'bold', color: '#2d3436'},
  sub: {fontSize: 13, color: '#6c757d', marginTop: 2},
});
