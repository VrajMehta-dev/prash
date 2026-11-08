import React from 'react';
import {Platform, Text, View} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import _ from 'lodash';
import CSwitch from '@components/CSwitch';
import {CustomIcon} from '@config/LoadIcons';
import GetStyles from './styles';

const IOS = Platform.OS === 'ios';
const PopOverItem = props => {
  const styles = GetStyles();
  const {
    onPress = () => {},
    label = '',
    iconName = '',
    style = {},
    iconStyle = {},
    textStyle = {},
    onAction = () => {},
    disabled = false,
    showSwitch = false,
    switchEnabled = false,
  } = props;

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.root, disabled && {opacity: 0.6}, style]}
      onPress={() => {
        onPress();
        setTimeout(
          () => {
            onAction();
          },
          IOS ? 600 : 0,
        );
      }}>
      {!_.isEmpty(iconName) && (
        <CustomIcon name={iconName} style={[styles.icon, iconStyle]} />
      )}
      <Text style={[styles.text, textStyle]}>{label}</Text>
      {showSwitch && (
        <View style={{marginLeft: 10}}>
          <CSwitch
            isActive={switchEnabled}
            onPress={() => {
              onPress();
              setTimeout(
                () => {
                  onAction();
                },
                IOS ? 600 : 0,
              );
            }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default PopOverItem;
