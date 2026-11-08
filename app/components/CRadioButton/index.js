import React from 'react';
import {View, Text} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import {useTheme} from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import _ from 'lodash';
import {CustomIcon} from '@config/LoadIcons';
import GetStyles from './styles';

const CRadioButton = props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {
    value = false,
    onPress = () => {},
    style = {},
    label = '',
    errorMsg = '',
    txtStyle = {},
    disabled = false,
  } = props;
  const showError = !_.isEmpty(errorMsg);
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.radioBtnContainer,
          style,
          disabled && styles.disabledOptionStyle,
        ]}
        disabled={disabled}>
        <View style={styles.indicatorContainer(disabled)}>
          {value && (
            <Animatable.View
              duration={200}
              animation={value ? 'zoomIn' : 'zoomOut'}
              style={styles.indicator(disabled)}
            />
          )}
        </View>
        {label && <Text style={[styles.labelText, txtStyle]}>{label}</Text>}
      </TouchableOpacity>
      {showError ? (
        <View style={styles.errorContainer}>
          <CustomIcon name="error" style={styles.errorIcon} />
          <Text style={[styles.errorText]}>{errorMsg}</Text>
        </View>
      ) : null}
    </>
  );
};

export default CRadioButton;
