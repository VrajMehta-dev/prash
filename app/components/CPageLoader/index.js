/* eslint-disable react/react-in-jsx-scope */
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import {useTheme} from '@react-navigation/native';
import propTypes from 'prop-types';
import {Images} from '@config/images';
import {CustomIcon} from '@config/LoadIcons';
import Icon, {Icons} from '@config/Icons';
import {translate} from '@lang/Translate';
import GetStyles from './styles';

const CPageLoader = props => {
  const {colors} = useTheme();
  const BaseColors = colors;
  const styles = GetStyles();
  const {
    style = {},
    lisEmptyComponent = false,
    showTitle = false,
    title = translate('No bills available'),
    description = '',
    titleStyle = {},
    size = '20',
    iconName = '',
    iconSize = 40,
    iconColor = BaseColors.emptyComponentIcon,
    loadMore = false,
    src = false,
  } = props;

  return lisEmptyComponent ? (
    <View style={[styles.emptyListContainer, style]}>
      <LottieView
        autoSize={false}
        style={[{height: `${80}%`, width: `${80}%`}]}
        source={src || Images?.noData}
        autoPlay={true}
        loop={true}
      />
      {showTitle && (
        <>
          <Animatable.Text
            // animation={'zoomIn'}
            // delay={100}
            style={[styles.titleText, titleStyle]}>
            {title}
          </Animatable.Text>
          <Animatable.Text
            // animation={'zoomIn'}
            // delay={100}
            style={[styles.descriptionText]}>
            {description}
          </Animatable.Text>
        </>
      )}
    </View>
  ) : loadMore ? (
    <View style={[styles.loadMoreStyle, style]}>
      <ActivityIndicator size={24} color={BaseColors.primary} />
    </View>
  ) : (
    <View style={[styles.root, style]}>
      <LottieView
        autoSize={false}
        style={[{height: `${size}%`, width: `${size}%`}]}
        source={Images?.noDataAvailTrans}
        autoPlay={true}
        loop={true}
      />
    </View>
  );
};

CPageLoader.propTypes = {
  style: propTypes.oneOfType([propTypes.object, propTypes.array]),
  lisEmptyComponent: propTypes.bool,
  showTitle: propTypes.bool,
  title: propTypes.string,
  description: propTypes.string,
  loaderStyle: propTypes.oneOfType([propTypes.object, propTypes.array]),
  titleStyle: propTypes.oneOfType([propTypes.object, propTypes.array]),
  size: propTypes.string,
  iconName: propTypes.string,
  iconSize: propTypes.oneOfType([propTypes.string, propTypes.number]),
  iconColor: propTypes.string,
  serverDisconnect: propTypes.bool,
  loadMore: propTypes.bool,
};
CPageLoader.defaultProps = {};
export default CPageLoader;
