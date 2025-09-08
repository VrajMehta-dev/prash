import React, {memo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Svg from 'react-native-svg';
import {useDerivedValue, withTiming} from 'react-native-reanimated';
import {useTheme} from '@react-navigation/native';
import _ from 'lodash';
import AnimatedColor from './AnimatedColor';
import AnimatedCheckMarkPath from './AnimatedCheckMarkPath';
import GetStyles from './styles';
import CErrorLog from '@components/CErrorLog';

const CheckBox = memo(props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {
    checked,
    size = 22,
    onChange = () => {},
    label = '',
    showError = false,
    errorMsg = '',
    style = {},
    textStyle = {},
  } = props;

  const progress = useDerivedValue(() => {
    return withTiming(checked ? 1 : 0);
  }, [checked]);

  return (
    <>
      <TouchableOpacity
        onPress={onChange}
        activeOpacity={0.6}
        style={[styles.root, style]}>
        <View style={{display: 'flex'}}>
          <Svg width={size} height={size} viewBox="0 0 49 49">
            <AnimatedColor
              progress={progress}
              checkedBorderColor={BaseColors.primary}
              unCheckedBorderColor={BaseColors.primary}
              checkedBackgroundColor={BaseColors.primary}
              unCheckedBackgroundColor={'#0000'}
            />
            <AnimatedCheckMarkPath
              progress={progress}
              checkMarkColor={'#FFF'}
            />
          </Svg>
        </View>
        {!_.isEmpty(label) && (
          <Text style={[styles.labelText, textStyle]}>{label}</Text>
        )}
      </TouchableOpacity>
      {showError ? <CErrorLog msg={errorMsg} /> : null}
    </>
  );
});

export default CheckBox;
