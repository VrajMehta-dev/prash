import React, {useEffect} from 'react';
import {View} from 'react-native';
import AdditionalCharges from '@screens/AdditionalCharges';
import DepositBanner from '@components/DepositBanner';
import {useSecurityDeposit} from '@utils/useSecurityDeposit';

// "Extra Charges" (one-off charges added by the office). Container Charges now has its own screen;
// old links that still ask for {segment: 'container'} are forwarded there.
export default function Charges(props) {
  const {navigation, route} = props;
  const {data: deposit} = useSecurityDeposit();

  useEffect(() => {
    if (route?.params?.segment === 'container') {
      navigation.navigate('Containers');
    }
  }, [route?.params?.segment]);

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <DepositBanner
        deposit={deposit}
        onPress={() => navigation.navigate('SecurityDeposit')}
        style={{marginTop: 48, marginBottom: 0}}
      />
      <View style={{flex: 1}}>
        <AdditionalCharges {...props} />
      </View>
    </View>
  );
}
