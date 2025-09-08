import React from 'react';
import {Text, View} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {CustomIcon} from '@config/LoadIcons';
import GetStyles from './styles';

const CErrorLog = props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;

  const {
    msg = '',
    color = BaseColors.errorColor,
    textStyle = {},
    style = {},
  } = props;

  return (
    <View style={[styles.errorContainer, style]}>
      <Text style={[styles.errorText, {color: color}, textStyle]}>{msg}</Text>
    </View>
  );
};

export default CErrorLog;
