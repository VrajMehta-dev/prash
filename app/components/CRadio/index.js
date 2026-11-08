import React from 'react';
import {View, Text} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import {useTheme} from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import _ from 'lodash';
import {GetTypography} from '@config/theme';
import {CustomIcon} from '@config/LoadIcons';
import {translate} from '@lang/Translate';
import GetStyles from './styles';

const CRadio = props => {
  const styles = GetStyles();
  const Typography = GetTypography();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {
    options,
    selectedOption,
    handleOptionSelect,
    style,
    errorMsg = '',
    singleStyle,
    txtStyle,
    disabled,
    translateFalse = false,
  } = props;
  const showError = !_.isEmpty(errorMsg);
  return (
    <>
      <View style={[style]}>
        {!_.isEmpty(options) && _.isArray(options)
          ? options?.map((option, index) => {
              const selected = option.id === selectedOption?.id;
              return ( 
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={option.value || `option_${index + 1}`}
                  onPress={() => !disabled && handleOptionSelect(option)}
                  style={[
                    styles.radioBtnContainer,
                    singleStyle,
                    disabled && styles.disabledOptionStyle,
                  ]}
                  disabled={disabled}>
                  <View style={styles.indicatorContainer(disabled)}>
                    {selected && (
                      <Animatable.View
                        duration={200}
                        animation={selected ? 'zoomIn' : 'zoomOut'}
                        style={styles.indicator(disabled)}
                      />
                    )}
                  </View>
                  <Text style={[styles.labelText, txtStyle]}>
                    {translateFalse ? option.label : translate(option.label)}
                  </Text>
                </TouchableOpacity>
              );
            })
          : null}
      </View>
      {showError ? (
        <View style={styles.errorContainer}>
          <CustomIcon name="error" style={styles.errorIcon} />
          <Text style={[styles.errorText]}>{errorMsg}</Text>
        </View>
      ) : null}
    </>
  );
};

export default CRadio;
