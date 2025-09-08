import React, {useEffect, useState} from 'react';
import {Modal, View, Text} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';
import PropTypes from 'prop-types';
import {Images} from '@config/images';
import {translate} from '@lang/Translate';
import styles from './styles';

const NoInternet = props => {
  const {} = props;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      handleConnectivity(state);
    });
  }, []);

  const handleConnectivity = state => {
    console.log('🌐️ ~ Connect Internet==>>', state.isConnected);
    if (state.isConnected) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };
  if (true) {
  } else {
    return (
      <Modal
        statusBarTranslucent
        transparent
        animationType="fade"
        visible={open}>
        <View style={styles.mainViewModal}>
          {open && (
            <BlurView
              style={styles.blurView}
              blurType="dark"
              blurAmount={4}
              reducedTransparencyFallbackColor="white"
            />
          )}
          <View style={styles.container}>
            <LottieView
              autoSize={false}
              style={[styles.animation]}
              source={Images?.noInternet}
              autoPlay
              loop
            />
            <View style={{marginTop: 10}}>
              <Text bold style={styles.offlineTitle}>
                {translate('Oops')}!
              </Text>
              <Text bold style={styles.offlineSubTxt}>
                {translate('NoInternetTitle')}
              </Text>
              <Text bold style={styles.offlineSubTxt}>
                {translate('NoInternetDescription')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
};

NoInternet.propTypes = {
  onConnect: PropTypes.func,
};

NoInternet.defaultProps = {
  onConnect: () => {},
};

export default NoInternet;
