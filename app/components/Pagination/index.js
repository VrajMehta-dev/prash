/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  interpolateColor,
} from 'react-native-reanimated';
import _ from 'lodash';

const Pagination = ({data = [], x, screenWidth, subscription = false}) => {
  const {colors} = useTheme();
  const BaseColors = colors;

  const PaginationComp = ({i}) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const widthAnimation = interpolate(
        x.value,
        [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
        [10, 40, 10],
        Extrapolation.CLAMP,
      );
      const opacityAnimation = interpolate(
        x.value,
        [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
        [0.5, 1, 0.5],
        Extrapolation.CLAMP,
      );

      const backgroundColorAnimation = interpolateColor(
        x.value,
        [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
        [
          BaseColors.thirdFontBlack,
          BaseColors.primary,
          BaseColors.thirdFontBlack,
        ],
      );

      let newObj = {
        width: widthAnimation,
        opacity: opacityAnimation,
      };
      if (subscription) {
        newObj.backgroundColor = backgroundColorAnimation;
      }
      return newObj;
    });
    return <Animated.View style={[styles.dots, animatedDotStyle]} />;
  };

  return (
    <View style={styles.paginationContainer}>
      {!_.isEmpty(data) && _.isArray(data)
        ? data?.map((item, i) => {
            return <PaginationComp i={i} key={i} />;
          })
        : null}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    height: 10,
    marginHorizontal: 6,
    borderRadius: 5,
    backgroundColor: 'black',
  },
});
