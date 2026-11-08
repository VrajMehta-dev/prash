import React from 'react';
import {View, StatusBar} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import ContainerCharges from '@components/ContainerCharges';

// Container Charges: its own screen. Layout (header, Pending/Paid tabs) matches Rent and Extra Charges.
export default function Containers({navigation}) {
  const isFocused = useIsFocused();
  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      {isFocused && <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />}
      <ContainerCharges navigation={navigation} />
    </View>
  );
}
