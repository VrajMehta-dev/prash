import Toast from 'react-native-toast-message';
import {apiGet} from '@utils/authedApi';

// Start an Easebuzz payment from an initiate-payment path. Returns true if the payment sheet opened.
// If the outlet's security deposit is unpaid the server refuses (403 SECURITY_DEPOSIT_UNPAID): send
// the tenant to the deposit screen instead of failing silently.
export async function startPayment(navigation, path) {
  const r = await apiGet(path);
  if (r.status === 403 && r.data?.code === 'SECURITY_DEPOSIT_UNPAID') {
    Toast.show({
      type: 'info',
      text1: 'Security deposit due',
      text2: 'Pay it to continue paying bills and charges.',
    });
    navigation.navigate('SecurityDeposit');
    return false;
  }
  if (r.ok && r.data?.access_key) {
    navigation.navigate('Settings', {
      link: r.data.payment_link,
      accessKey: r.data.access_key,
      isCharge: true,
    });
    return true;
  }
  Toast.show({
    type: 'error',
    text1: 'Payment',
    text2: r.data?.msg || 'Could not start the payment. Please try again.',
  });
  return false;
}
