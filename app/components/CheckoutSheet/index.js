import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Modal, View, Text, StyleSheet, Pressable, Animated, Easing, ActivityIndicator, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';
import BaseSetting from '@config/setting';
import {apiGet} from '@utils/authedApi';
import {tap} from '@utils/haptics';
import {downloadPdf} from '@utils/downloadPdf';
import {subscribeCheckout, KIND} from '@utils/checkout';
import {emitPaymentChange} from '@utils/paymentEvents';
import {goToTab} from '../../navigation/NavigationService';

// The native Easebuzz SDK is loaded defensively: a build without it can still show the sheet.
let initializeEasebuzzCheckout = null;
try {
  initializeEasebuzzCheckout = require('react-native-easebuzz-sdk').initializeEasebuzzCheckout;
} catch (e) {}

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BUSY = ['starting', 'sdk', 'confirming']; // the sheet cannot be dismissed while one of these is running

// The SDK resolves with a JSON string: {"result":"payment_successfull","response":{...signed fields}}.
const parseSdk = raw => {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw || {};
  } catch (e) {
    return {};
  }
};

// Easebuzz's own signed response goes to the same success/failure URL it would have hit itself. The server verifies the
// signature, so only a genuine response can settle (or fail) a payment. Network trouble here is not fatal: the webhook
// can still deliver, and we keep checking the server below.
const forward = async (path, response) => {
  try {
    await fetch(BaseSetting.baseUrl + path, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(response),
    });
  } catch (e) {}
};

export default function CheckoutSheet() {
  const shop = useSelector(s => s.auth.shopSelected);
  const [item, setItem] = useState(null);
  const [stage, setStage] = useState('review');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState({});
  const [open, setOpen] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;
  const lock = useRef(false);
  const itemRef = useRef(null);

  const show = useCallback(
    it => {
      itemRef.current = it;
      setItem(it);
      setStage('review');
      setMessage('');
      setResult({});
      lock.current = false;
      setOpen(true);
      slide.setValue(0);
      Animated.timing(slide, {toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true}).start();
    },
    [slide],
  );
  useEffect(() => subscribeCheckout(show), [show]);

  const close = () => {
    if (BUSY.includes(stage)) {
      return;
    }
    Animated.timing(slide, {toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true}).start(() => setOpen(false));
  };

  // Ask the server whether the item is paid; true = settled, false = still unknown after ~30 s.
  const waitForServer = async it => {
    for (let i = 0; i < 12; i++) {
      const r = await apiGet(`client/payments/status/${it.kind}/${it.id}`);
      if (r.ok && r.data?.paid) {
        return {paid: true, ref_no: r.data.ref_no};
      }
      if (r.ok && r.data?.last_attempt === 'failed') {
        return {paid: false, failed: true};
      }
      await sleep(2500);
    }
    return {paid: false};
  };

  const succeeded = async (it, ref) => {
    tap('notificationSuccess');
    setResult({ref});
    setStage('success');
    emitPaymentChange();
  };

  const pay = async () => {
    if (lock.current || !item) {
      return;
    }
    lock.current = true;
    const it = itemRef.current;
    const k = KIND[it.kind];
    try {
      setStage('starting');
      const r = await apiGet(k.initiate(it));
      if (!r.ok || !r.data?.access_key) {
        const code = r.data?.code;
        if (r.status === 403 && code === 'SECURITY_DEPOSIT_UNPAID') {
          setMessage('Pay the security deposit first. Rent and charges for this outlet unlock once it is paid.');
          setStage('blocked');
        } else if (code === 'PAYMENT_BLOCKED') {
          setMessage(r.data.msg || 'Something else has to be paid first.');
          setStage('blocked');
        } else if (code === 'PAYMENT_IN_PROGRESS') {
          setMessage(r.data.msg);
          setStage('inprogress');
        } else {
          setMessage(r.data?.msg || 'We could not start the payment. Please try again.');
          setStage('failed');
        }
        return;
      }
      if (!initializeEasebuzzCheckout) {
        setMessage('Payments need the latest version of the app. Please update it.');
        setStage('failed');
        return;
      }

      // Hide our sheet while Easebuzz is on screen (iOS cannot present a second layer over a Modal).
      setStage('sdk');
      setOpen(false);
      await sleep(Platform.OS === 'ios' ? 450 : 120);
      let outcome = {};
      try {
        outcome = parseSdk(await initializeEasebuzzCheckout(r.data.access_key, BaseSetting.payMode));
      } catch (e) {
        outcome = {};
      }
      setOpen(true);
      slide.setValue(1);

      const res = outcome?.result;
      const signed = outcome?.response;
      if (res === 'payment_successfull' && signed?.status === 'success') {
        setStage('confirming');
        await forward(k.success, signed);
        const s = await waitForServer(it);
        if (s.paid) {
          await succeeded(it, s.ref_no || signed.easepayid);
        } else {
          setStage('pending');
        }
      } else if (signed && signed.status && signed.status !== 'success' && signed.hash) {
        // Easebuzz told us it failed: the server unlocks the retry at once.
        await forward(k.failure, signed);
        tap('notificationError');
        setMessage(signed.error_Message || signed.error || 'The payment did not go through.');
        setStage('failed');
      } else if (res === 'user_cancelled' || res === 'bank_back_pressed') {
        setStage('cancelled');
      } else {
        // No definite answer from the SDK: do not assume anything, ask the server.
        setStage('confirming');
        const s = await waitForServer(it);
        if (s.paid) {
          await succeeded(it, s.ref_no);
        } else if (s.failed) {
          setMessage('The payment did not go through.');
          setStage('failed');
        } else {
          setStage('unclear');
        }
      }
    } finally {
      lock.current = false;
    }
  };

  // "Check status" for payments we could not confirm yet.
  const recheck = async () => {
    if (lock.current || !item) {
      return;
    }
    lock.current = true;
    setStage('confirming');
    const s = await waitForServer(item);
    lock.current = false;
    if (s.paid) {
      await succeeded(item, s.ref_no);
    } else if (s.failed) {
      setMessage('The payment did not go through. You can try again.');
      setStage('failed');
    } else {
      setStage('pending');
    }
  };

  if (!item) {
    return null;
  }
  const k = KIND[item.kind];
  const canClose = !BUSY.includes(stage);
  const translateY = slide.interpolate({inputRange: [0, 1], outputRange: [420, 0]});

  const body = () => {
    switch (stage) {
      case 'review':
        return (
          <>
            <Text style={styles.title}>Review & pay</Text>
            <View style={styles.summary}>
              <View style={styles.iconBox}>
                <Icon name={ICON[item.kind]} size={22} color={Brand.primary} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemSub}>{item.subtitle || k.label}</Text>
              </View>
            </View>
            <View style={styles.rows}>
              <Row label="Outlet" value={shop?.property_name || '-'} />
              <Row label="Pay for" value={k.label} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.total}>{money(item.amount)}</Text>
              </View>
            </View>
            <Text style={styles.secure}>
              <Icon name="lock-closed-outline" size={13} color="#8A8A95" /> Secure payment by Easebuzz: UPI, cards and net banking.
            </Text>
            <Button label={`Pay ${money(item.amount)}`} onPress={pay} />
          </>
        );
      case 'starting':
        return <Busy text="Getting your payment ready..." />;
      case 'confirming':
        return <Busy text="Confirming your payment..." sub="This takes a few seconds. Please don't close the app." />;
      case 'success':
        return (
          <View style={styles.center}>
            <Circle bg="#DDF5E7" icon="checkmark" color="#1E7B4B" />
            <Text style={styles.stateTitle}>Payment successful</Text>
            <Text style={styles.stateAmount}>{money(item.amount)}</Text>
            <Text style={styles.stateText}>{item.title}{result.ref ? `\nRef: ${result.ref}` : ''}</Text>
            <Button
              label="Download receipt"
              icon="download-outline"
              onPress={() => downloadPdf(k.receipt(item), 'receipt.pdf')}
            />
            <Ghost label="Done" onPress={close} />
          </View>
        );
      case 'failed':
        return (
          <View style={styles.center}>
            <Circle bg="#FBE4E1" icon="close" color="#C0392B" />
            <Text style={styles.stateTitle}>Payment didn't go through</Text>
            <Text style={styles.stateText}>{message}</Text>
            <Button label="Try again" onPress={() => { setStage('review'); }} />
            <Ghost label="Close" onPress={close} />
          </View>
        );
      case 'cancelled':
        return (
          <View style={styles.center}>
            <Circle bg="#FFF1D6" icon="arrow-undo" color="#9A5B00" />
            <Text style={styles.stateTitle}>Payment cancelled</Text>
            <Text style={styles.stateText}>
              If money was taken from your account, we'll confirm it shortly. You can try again in about 10 minutes,
              or sooner if your bank tells us it failed.
            </Text>
            <Button label="Check status" onPress={recheck} />
            <Ghost label="Close" onPress={close} />
          </View>
        );
      case 'pending':
      case 'unclear':
        return (
          <View style={styles.center}>
            <Circle bg="#FFF1D6" icon="time-outline" color="#9A5B00" />
            <Text style={styles.stateTitle}>We're still confirming</Text>
            <Text style={styles.stateText}>
              {stage === 'pending'
                ? 'Your bank has accepted the payment and we are waiting for the final confirmation. This can take a few minutes. Please do not pay again.'
                : 'We could not confirm the payment yet. If money was taken it will show here shortly. Please do not pay again.'}
            </Text>
            <Button label="Check status" onPress={recheck} />
            <Ghost label="Close" onPress={close} />
          </View>
        );
      case 'inprogress':
        return (
          <View style={styles.center}>
            <Circle bg="#FFF1D6" icon="time-outline" color="#9A5B00" />
            <Text style={styles.stateTitle}>Last payment still being confirmed</Text>
            <Text style={styles.stateText}>{message}</Text>
            <Button label="Check status" onPress={recheck} />
            <Ghost label="Close" onPress={close} />
          </View>
        );
      case 'blocked':
        return (
          <View style={styles.center}>
            <Circle bg="#FFF1D6" icon="lock-closed-outline" color="#9A5B00" />
            <Text style={styles.stateTitle}>Not yet</Text>
            <Text style={styles.stateText}>{message}</Text>
            {message.includes('security deposit') ? (
              <Button label="Go to security deposit" onPress={() => { close(); goToTab('SecurityDeposit'); }} />
            ) : (
              <Button label="Pay in order" onPress={() => { close(); goToTab('Pay'); }} />
            )}
            <Ghost label="Close" onPress={close} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={open} transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <Animated.View style={[styles.sheet, {transform: [{translateY}]}]}>
        <View style={styles.grab} />
        {canClose && (
          <TouchableOpacity style={styles.x} onPress={close} hitSlop={10}>
            <Icon name="close" size={22} color="#6B6B76" />
          </TouchableOpacity>
        )}
        {body()}
      </Animated.View>
    </Modal>
  );
}

const ICON = {bill: 'receipt-outline', additional_charge: 'layers-outline', container_charge: 'cube-outline', deposit: 'shield-checkmark-outline'};

const Row = ({label, value}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
  </View>
);
const Busy = ({text, sub}) => (
  <View style={[styles.center, {paddingVertical: 36}]}>
    <ActivityIndicator size="large" color={Brand.primary} />
    <Text style={styles.stateTitle}>{text}</Text>
    {!!sub && <Text style={styles.stateText}>{sub}</Text>}
  </View>
);
const Circle = ({bg, icon, color}) => (
  <View style={[styles.circle, {backgroundColor: bg}]}>
    <Icon name={icon} size={38} color={color} />
  </View>
);
const Button = ({label, onPress, icon}) => (
  <TouchableOpacity activeOpacity={0.9} onPress={() => { tap(); onPress(); }} style={styles.cta}>
    {!!icon && <Icon name={icon} size={20} color="#fff" />}
    <Text style={styles.ctaText}>{label}</Text>
  </TouchableOpacity>
);
const Ghost = ({label, onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.ghost}>
    <Text style={styles.ghostText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,10,30,0.45)'},
  sheet: {position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28},
  grab: {alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDD', marginBottom: 12},
  x: {position: 'absolute', right: 16, top: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 20, fontWeight: '800', color: '#17171C', marginBottom: 14},
  summary: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F6EEF2', borderRadius: 18, padding: 14},
  iconBox: {width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'},
  itemTitle: {fontSize: 16, fontWeight: '700', color: '#17171C'},
  itemSub: {fontSize: 13, color: '#6B6B76', marginTop: 2},
  rows: {marginTop: 12},
  row: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: '#ECECF1'},
  rowLabel: {color: '#8A8A95', fontSize: 14},
  rowValue: {color: '#17171C', fontSize: 14, fontWeight: '600', maxWidth: '65%'},
  totalRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14},
  totalLabel: {color: '#17171C', fontSize: 16, fontWeight: '700'},
  total: {color: '#17171C', fontSize: 26, fontWeight: '800'},
  secure: {color: '#8A8A95', fontSize: 12, textAlign: 'center', marginTop: 12},
  cta: {height: 54, borderRadius: 16, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 14},
  ctaText: {color: '#fff', fontSize: 17, fontWeight: '700'},
  ghost: {alignItems: 'center', paddingVertical: 14},
  ghostText: {color: Brand.primary, fontSize: 15, fontWeight: '700'},
  center: {alignItems: 'center'},
  circle: {width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginTop: 6},
  stateTitle: {color: '#17171C', fontSize: 20, fontWeight: '800', marginTop: 16, textAlign: 'center'},
  stateAmount: {color: Brand.primary, fontSize: 30, fontWeight: '800', marginTop: 6},
  stateText: {color: '#6B6B76', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8, marginBottom: 8},
});
