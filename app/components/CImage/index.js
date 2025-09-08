import React, {useState} from 'react';
import FastImage from 'react-native-fast-image';
import Animated from 'react-native-reanimated';
import {useTheme} from '@react-navigation/native';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Images} from '@config/images';
import GetStyles from './styles';

const CImage = props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;

  // Destructuring props to extract values
  const {src = '', style = {}, resizeMode = FastImage.resizeMode.cover} = props;

  // State Variables
  const [error, setError] = useState(false);

  return (
    <FastImage
      source={
        error
          ? Images?.Avatar
          : !_.isEmpty(src) && _.isString(src)
          ? {uri: src, priority: FastImage.priority.high}
          : Images?.Avatar
      }
      onError={() => {
        setError(true);
      }}
      style={[styles.profileImage, style]}
      resizeMode={resizeMode}
    />
  );
};

CImage.propTypes = {
  resizeMode: PropTypes.any,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  src: PropTypes.string,
  banner: PropTypes.bool,
  showGradient: PropTypes.bool,
  bannerSize: PropTypes.string,
  token: PropTypes.bool,
  tokenWithBg: PropTypes.bool,
  itineraryIcon: PropTypes.bool,
  tintColor: PropTypes.string,
  iconName: PropTypes.string,
  iconStyle: PropTypes.object,
  animatedImage: PropTypes.bool,
  isSponsored: PropTypes.bool,
  sponsoredName: PropTypes.string,
};

export default CImage;
