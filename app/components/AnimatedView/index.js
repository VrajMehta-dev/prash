import React from 'react';
import Animated, {FadeInDown, FadeOutDown} from 'react-native-reanimated';
import {useTheme} from '@react-navigation/native';
import GetStyles from './styles';

const AnimatedView = props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;

  const {children, style = {}} = props;
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(300).withInitialValues(0)}
      exiting={FadeOutDown.withInitialValues(1)}
      style={[styles.mainContainer, style]}>
      {children}
    </Animated.View>
  );
};
export default AnimatedView;
