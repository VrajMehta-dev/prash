import React from 'react';
import {useIsFocused} from '@react-navigation/native';
import DepositGate from '@components/DepositGate';
import {useSecurityDeposit} from '@utils/useSecurityDeposit';

// Tab screens that need a paid deposit show the gate page instead while the deposit is unpaid.
export default function withDepositGate(Screen) {
  function WithDepositGate(props) {
    const {data} = useSecurityDeposit();
    useIsFocused(); // keeps the hook's focus refresh tied to this screen
    return data?.locked ? <DepositGate deposit={data} navigation={props.navigation} /> : <Screen {...props} />;
  }
  return WithDepositGate;
}
