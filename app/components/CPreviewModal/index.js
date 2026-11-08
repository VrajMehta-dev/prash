/* eslint-disable react/react-in-jsx-scope */
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Dimensions, Image, Modal, View} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import {BlurView} from '@react-native-community/blur';
import _ from 'lodash';
import {useTheme} from '@react-navigation/native';
import Video from 'react-native-video';
import CPageLoader from '@components/CPageLoader';
import Icon, {Icons} from '@config/Icons';
import GetStyles from './styles';

const CPreviewModal = forwardRef((props, ref) => {
  const {} = props;

  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;

  const [visible, setVisible] = useState(false);
  const [type, setType] = useState('');
  const [url, setUrl] = useState('');
  const [imageLoader, setImageLoader] = useState('');

  useImperativeHandle(ref, () => ({
    open(image, fileType) {
      if (!_.isEmpty(image)) {
        setVisible(true);
        setUrl(image);
        setType(fileType);
      }
    },
    stop() {
      setVisible(false);
    },
  }));

  return (
    <Modal
      statusBarTranslucent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        setVisible(false);
      }}>
      <View style={[styles.backgroundContainer]}>
        {visible ? (
          <BlurView
            style={styles.blurView}
            blurType="dark"
            blurAmount={4}
            reducedTransparencyFallbackColor="white"
          />
        ) : null}
        <View style={[styles.warningModalContainer]}>
          {imageLoader && (
            <CPageLoader
              style={[
                styles.videoPlayerLoader,
                {
                  zIndex: 1,
                  position: 'absolute',
                  backgroundColor: 'transparent',
                },
              ]}
            />
          )}
          <Image
            style={{
              height: Dimensions.get('screen').height / 1.5,
            }}
            resizeMode="contain"
            source={_.isString(url) ? {uri: url} : url}
            onLoadStart={() => {
              setImageLoader(true);
            }}
            onLoad={() => {
              setImageLoader(false);
            }}
          />
        </View>
        <TouchableOpacity
          style={styles.closeIconContainer}
          onPress={() => {
            setVisible(false);
          }}>
          <Icon
            type={Icons.Ionicons}
            name="close"
            size={28}
            color={BaseColors.primary}
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
});

export default CPreviewModal;
