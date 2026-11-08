import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import {initializeEasebuzzCheckout} from 'react-native-easebuzz-sdk';
import BaseSetting from '@config/setting';

const Settings = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const accessKey = route?.params?.accessKey; // Must come from backend
  const payMode = BaseSetting.payMode; // 'test' (UAT app) or 'production'

  useEffect(() => {
    if (!accessKey) {
      Toast.show({
        type: 'error',
        text1: 'Access Key Missing',
        text2: 'Please Click Pay Again',
      });
      navigation.goBack();
      return;
    }
    setTimeout(() => {
      initiatePayment();
    }, 1000);
  }, []);

  const initiatePayment = async () => {
    try {
      const raw = await initializeEasebuzzCheckout(accessKey, payMode);
      // The native SDK resolves with a JSON *string*: {"result":"payment_successfull","response":{...signed fields}}
      let outcome = null;
      try {
        outcome = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {}
      const paid =
        outcome?.result === 'payment_successfull' &&
        outcome?.response?.status === 'success';

      if (paid) {
        Toast.show({
          type: 'success',
          text1: 'Payment successful',
          text2: 'Thank you! Updating your account...',
        });
        // Security deposit: hand the signed response to the server, which verifies Easebuzz's signature
        // and marks it paid. Works even when Easebuzz's own webhook can't reach us; the webhook stays
        // the primary path and this is idempotent with it.
        if (String(outcome.response.txnid || '').includes('SDT')) {
          try {
            await fetch(
              BaseSetting.baseUrl + 'client/security-deposit/easebuzz/success',
              {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(outcome.response),
              },
            );
          } catch (e) {}
        }
        setTimeout(() => {
          navigation.goBack();
        }, 500);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Easebuzz Error:', error);
      navigation.goBack();
    }
  };

  const handleGoBack = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.infoContainer}>
        <Icon name="lock-closed" size={20} color="#5C6BC0" />
        <Text style={styles.infoText}>
          Your payment is secure and encrypted
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9f9f9'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {padding: 8},
  headerTitle: {fontSize: 18, fontWeight: '600', color: '#333'},
  rightPlaceholder: {width: 40},
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  infoText: {color: '#5C6BC0', marginLeft: 8, fontSize: 14},
});

export default Settings;
