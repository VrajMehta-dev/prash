import {StyleSheet, useWindowDimensions, View} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import React from 'react';
import PressableScale from './PressableScale';
import {useTheme} from '@react-navigation/native';
import {FontFamily} from '@config/theme';

const ButtonHeight = 60;

export const SplitButton = ({
  splitted,
  mainAction,
  leftAction,
  rightAction,
}) => {
  const {colors} = useTheme();
  const BaseColors = colors;
  const {width: windowWidth} = useWindowDimensions();

  const paddingHorizontal = 20;
  const gap = 10;
  const SplittedButtonWidth = (windowWidth - paddingHorizontal * 2 - gap) / 2;

  const rLeftButtonStyle = useAnimatedStyle(() => {
    const leftButtonWidth = splitted ? SplittedButtonWidth : 0;
    return {
      width: withTiming(leftButtonWidth),
      opacity: withTiming(splitted ? 1 : 0),
    };
  }, [splitted]);

  const rLeftTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splitted ? 1 : 0, {
        duration: 150,
      }),
    };
  }, [splitted]);

  const rMainButtonStyle = useAnimatedStyle(() => {
    const mainButtonWidth = splitted
      ? SplittedButtonWidth
      : SplittedButtonWidth * 2 + gap;
    return {
      width: withTiming(mainButtonWidth),
      marginLeft: withTiming(splitted ? gap : 0),
      backgroundColor: withTiming(
        splitted ? rightAction.backgroundColor : mainAction.backgroundColor,
      ),
    };
  }, [splitted]);

  const rMainTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splitted ? 0 : 1),
    };
  }, [splitted]);

  const rRightTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splitted ? 1 : 0),
    };
  }, [splitted]);

  return (
    <View
      style={{
        width: '100%',
        height: ButtonHeight,
        paddingHorizontal,
        flexDirection: 'row',
      }}>
      <PressableScale
        onPress={leftAction.onPress}
        style={[
          {
            backgroundColor: leftAction.backgroundColor,
          },
          rLeftButtonStyle,
          styles.button,
        ]}>
        <Animated.Text numberOfLines={1} style={[styles.label, rLeftTextStyle]}>
          {leftAction.label}
        </Animated.Text>
      </PressableScale>
      <PressableScale
        onPress={splitted ? rightAction.onPress : mainAction.onPress}
        style={[rMainButtonStyle, styles.button]}>
        <Animated.Text
          style={[
            styles.label,
            {
              color:
                mainAction?.backgroundColor == BaseColors.primary
                  ? 'white'
                  : BaseColors.primary,
            },
            rMainTextStyle,
          ]}>
          {mainAction.label}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.label,
            {
              color:
                rightAction?.backgroundColor == BaseColors.primary
                  ? 'white'
                  : BaseColors.primary,
            },
            rRightTextStyle,
          ]}>
          {rightAction.label}
        </Animated.Text>
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: '#000',
    fontFamily: FontFamily.semiBold,
    position: 'absolute',
  },
  button: {
    height: ButtonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    borderCurve: 'continuous',
  },
});
