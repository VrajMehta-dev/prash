import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Linking,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import BaseSetting from '@config/setting';
import {Brand} from '@config/brand';
import BrandBackdrop from '@components/BrandBackdrop';
import {tap} from '@utils/haptics';

const ForceUpdateModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAppVersion();
  }, []);

  const checkAppVersion = async () => {
    try {
      setLoading(true);

      // Min version comes from the server so it can be raised without a release.
      // No versionUrl (prod, for now) or any fetch failure => never block the user.
      if (!BaseSetting.versionUrl) return;
      const res = await fetch(BaseSetting.versionUrl, {cache: 'no-store'});
      const cfg = (await res.json())[Platform.OS];
      const currentVersion = DeviceInfo.getVersion();
      const minRequiredVersion = cfg.min;

      // Compare versions
      if (isVersionLowerThan(currentVersion, minRequiredVersion)) {
        setShowModal(true); 
      }
    } catch (error) {
      console.error('Error checking app version:', error);
      // In case of error, we don't force update to avoid blocking users
    } finally {
      setLoading(false);
    }
  };

  // Helper function to compare versions
  const isVersionLowerThan = (currentVersion, minVersion) => {
    const current = currentVersion.split('.').map(Number);
    const minimum = minVersion.split('.').map(Number);

    for (let i = 0; i < Math.max(current.length, minimum.length); i++) {
      const currentPart = current[i] || 0;
      const minimumPart = minimum[i] || 0;

      if (currentPart < minimumPart) return true;
      if (currentPart > minimumPart) return false;
    }

    return false; // Versions are equal
  };

  const handleUpdate = () => {
    // Get the app's package name/bundle ID
    const packageName = DeviceInfo.getBundleId();
    console.log('packageName', packageName);

    const storeUrl = Platform.select({
      ios: `https://apps.apple.com/app/id${6743940477}`,
      android: `https://play.google.com/store/apps/details?id=${packageName}`,
    });
    console.log('storeUrl', storeUrl);

    Linking.canOpenURL(storeUrl).then(supported => {
      if (supported) {
        Linking.openURL(storeUrl);
      } else {
        console.error("Can't open store URL");
      }
    });
  };

  if (loading) {
    return null; // Or a loading indicator if you prefer
  }

  return (
    <Modal
      visible={showModal}
      transparent={false}
      statusBarTranslucent
      animationType="fade"
      // No onRequestClose: the Android back button must not dismiss a forced update
    >
      <StatusBar barStyle="light-content" backgroundColor={Brand.gradientTop} />
      <BrandBackdrop style={styles.screen}>
        <Text style={styles.wordmark}>{Brand.name}</Text>
        <View style={styles.body}>
          <Text style={styles.title}>Update required</Text>
          <Text style={styles.message}>
            A newer version of PRASH is available. Please update to keep paying
            your dues and receiving alerts.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.updateButton}
          activeOpacity={0.85}
          onPress={() => {
            tap('impactMedium');
            handleUpdate();
          }}>
          <Text style={styles.updateButtonText}>Update now</Text>
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
  body: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  message: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  updateButtonText: {
    color: Brand.primary,
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default ForceUpdateModal;
