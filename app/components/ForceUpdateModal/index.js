import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Linking,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import BaseSetting from '@config/setting';

const ForceUpdateModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [updateUrl, setUpdateUrl] = useState(null);

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
      setUpdateUrl(cfg.url);

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

    const storeUrl = updateUrl || Platform.select({
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
      transparent={true}
      animationType="fade"
      // No onRequestClose to prevent hardware back button from closing the modal on Android
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Update Required</Text>
          <Text style={styles.message}>
            A new version of the app is available. Please update to continue
            using the app.
          </Text>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: '#632240',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    width: '100%',
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ForceUpdateModal;
