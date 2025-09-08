import React from 'react';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from '@react-navigation/native';
import {CustomIcon} from '@config/LoadIcons';
import Icon, { Icons } from '@config/Icons';

const Arrow = ({isOpen}) => {
  const {colors} = useTheme();
  const BaseColors = colors;

  const progress = useDerivedValue(() =>
    isOpen ? withTiming(1) : withTiming(0),
  );
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${progress.value * -180}deg`}],
  }));

  return (
    <Animated.View style={iconStyle}>
      <Icon
      type={Icons.Ionicons}
        name="chevron-down"
        size={20}
        color={BaseColors.inputLabel}
      />
    </Animated.View>
  );
};

export default Arrow;
