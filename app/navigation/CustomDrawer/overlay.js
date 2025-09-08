import React from 'react';
import {Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

const Overlay = props => {
  // Destructuring props to extract values
  const {active = false, onPress = () => {}} = props;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      display: active.value ? 'flex' : 'none',
    };
  });
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.subContainer}
        onPress={onPress}
      />
    </Animated.View>
  );
};

Overlay.propTypes = {};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    left: Dimensions.get('screen').width / 1.5,
    maxWidth: Dimensions.get('screen').width / 1.5,
  },
  subContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});
export default Overlay;
