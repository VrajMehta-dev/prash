import React from 'react';
import {View} from 'react-native';
import {useTheme} from '@react-navigation/native';
import CountryFlag from 'react-native-country-flag';
import GetStyles from './styles';

const CFlag = props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;

  const {code, size = 16, style = {}} = props;
  return (
    <View style={[styles.container, style]}>
      <CountryFlag isoCode={String(code)} style={styles.flag} size={size} />
    </View>
  );
};
export default CFlag;
