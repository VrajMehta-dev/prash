import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import Icon, {Icons} from '@config/Icons';
import BaseSetting from '@config/setting';
import {Brand} from '@config/brand';
import BrandBackdrop from '@components/BrandBackdrop';
import {tap} from '@utils/haptics';

// "Reachable" means our own backend answers (any non-5xx), not just that Wi-Fi is on,
// so a captive portal / dead uplink counts as offline too.
NetInfo.configure({
  reachabilityUrl: BaseSetting.api,
  reachabilityTest: async response => response.status < 500,
  reachabilityShortTimeout: 5000,
});

const SHOW_AFTER_MS = 2000; // ignore blips from network handoffs

const OfflineScreen = () => {
  const net = useNetInfo();
  const down = net.isConnected === false || net.isInternetReachable === false;
  const [show, setShow] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!down) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, [down]);

  const retry = async () => {
    tap('impactMedium');
    setRetrying(true);
    try {
      await NetInfo.refresh();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Modal
      visible={show}
      transparent={false}
      statusBarTranslucent
      animationType="fade">
      <StatusBar barStyle="light-content" backgroundColor={Brand.gradientTop} />
      <BrandBackdrop style={styles.screen}>
        <Text style={styles.wordmark}>{Brand.name}</Text>
        <View style={styles.body}>
          <Icon
            type={Icons.Ionicons}
            name="cloud-offline-outline"
            style={styles.icon}
          />
          <Text style={styles.title}>
            {net.isConnected === false ? 'You are offline' : "Can't reach PRASH"}
          </Text>
          <Text style={styles.message}>
            {net.isConnected === false
              ? 'Turn on mobile data or Wi-Fi to continue.'
              : 'Your connection looks unstable or our servers are unreachable. Please try again.'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          disabled={retrying}
          onPress={retry}>
          {retrying ? (
            <ActivityIndicator color={Brand.primary} />
          ) : (
            <Text style={styles.buttonText}>Try again</Text>
          )}
        </TouchableOpacity>
      </BrandBackdrop>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  wordmark: {
    color: '#fff',
    fontFamily: Brand.wordmarkFont,
    fontSize: 32,
    letterSpacing: Brand.wordmarkSpacing,
    textAlign: 'center',
  },
  body: {alignItems: 'center'},
  icon: {fontSize: 84, color: 'rgba(255,255,255,0.9)', marginBottom: 20},
  title: {color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 12},
  message: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {color: Brand.primary, fontWeight: 'bold', fontSize: 17},
});

export default OfflineScreen;
