import React, {useRef, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Toast from 'react-native-toast-message';
import TouchableOpacity from '@components/PressableScale';
import {ResetLayout, OtpBoxes, PrimaryButton, resetApi, fmtClock, useSecondsLeft, OTP_LENGTH} from '@components/ResetFlow';
import {Brand} from '@config/brand';
import {tap} from '@utils/haptics';

// Step 2: enter the code. It is checked by the server right away (the old flow only found out at the last step).
export default function ResetCode({navigation, route}) {
  const {email} = route.params;
  const [code, setCode] = useState('');
  const [expireAt, setExpireAt] = useState(Date.now() + (route.params.expiresIn || 300) * 1000);
  const [resendAt, setResendAt] = useState(Date.now() + (route.params.resendIn ?? 60) * 1000);
  const [error, setError] = useState('');
  const [errorKey, setErrorKey] = useState(0);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const expiresLeft = useSecondsLeft(expireAt);
  const resendLeft = useSecondsLeft(resendAt);
  const expired = expiresLeft === 0 || locked;

  const fail = msg => {
    setError(msg);
    setErrorKey(k => k + 1);
    setCode('');
    tap('notificationError');
  };

  const verify = async digits => {
    if (inFlight.current || expired) {
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError('');
    const r = await resetApi('verify-reset-otp', {email, otp: digits});
    inFlight.current = false;
    setBusy(false);
    if (r.offline) {
      setCode('');
      Toast.show({type: 'error', text1: "You're offline", text2: 'Connect to the internet and enter the code again.'});
      return;
    }
    if (r.ok) {
      tap('notificationSuccess');
      navigation.navigate('ResetNewPassword', {email, resetToken: r.data.reset_token});
      return;
    }
    const c = r.data?.code;
    if (c === 'OTP_LOCKED') {
      setLocked(true);
      fail('Too many wrong tries. Request a new code.');
    } else if (c === 'OTP_EXPIRED') {
      setExpireAt(0);
      setCode('');
      setError('This code has expired. Request a new one.');
    } else if (c === 'OTP_INVALID') {
      const left = r.data.attempts_left;
      fail(left === 1 ? "That code isn't right. Last try. After this you'll need a new code." : `That code isn't right. ${left} tries left.`);
    } else {
      fail(r.data?.msg || 'Something went wrong. Please try again.');
    }
  };

  const resend = async () => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setBusy(true);
    const r = await resetApi('request-password-reset', {email, otp_length: 4});
    inFlight.current = false;
    setBusy(false);
    if (r.offline) {
      Toast.show({type: 'error', text1: "You're offline", text2: 'Connect to the internet and try again.'});
    } else if (r.ok) {
      setExpireAt(Date.now() + (r.data.expires_in || 300) * 1000);
      setResendAt(Date.now() + (r.data.resend_in || 60) * 1000);
      setCode('');
      setError('');
      setLocked(false);
      Toast.show({type: 'success', text1: 'New code sent', text2: 'The old one no longer works.'});
    } else if (r.data?.code === 'RESEND_COOLDOWN') {
      setResendAt(Date.now() + (r.data.retry_after || 60) * 1000);
    } else {
      setError(r.data?.msg || 'Could not send a new code. Please try again.');
    }
  };

  return (
    <ResetLayout
      step={2}
      title="Check your email"
      subtitle={`We sent a 4-digit code to ${email}.`}
      onBack={() => navigation.goBack()}>
      <OtpBoxes value={code} onChange={setCode} onComplete={verify} hasError={!!error} errorKey={errorKey} editable={!expired && !busy} />

      <View style={styles.statusRow}>
        {busy ? (
          <ActivityIndicator color={Brand.primary} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : expired ? (
          <Text style={styles.error}>This code has expired.</Text>
        ) : (
          <Text style={styles.muted}>{`Code expires in ${fmtClock(expiresLeft)}`}</Text>
        )}
      </View>

      {expired ? (
        <PrimaryButton label="Send a new code" onPress={resend} loading={busy} />
      ) : (
        <PrimaryButton label="Verify" onPress={() => verify(code)} disabled={code.length < OTP_LENGTH} loading={busy} />
      )}

      {!expired && (
        <TouchableOpacity style={styles.resend} disabled={resendLeft > 0 || busy} onPress={() => { tap(); resend(); }}>
          <Text style={[styles.resendText, resendLeft > 0 && {color: '#A0A0AB'}]}>
            {resendLeft > 0 ? `Didn't get it? Resend in ${fmtClock(resendLeft)}` : 'Resend code'}
          </Text>
        </TouchableOpacity>
      )}
      <Text style={styles.help}>Check your spam folder too. Mail can take a minute to arrive.</Text>
      <Text style={styles.wrong} onPress={() => navigation.navigate('ResetEmail', {email})}>
        Wrong email?
      </Text>
    </ResetLayout>
  );
}

const styles = StyleSheet.create({
  statusRow: {minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 14, marginBottom: 6},
  error: {color: '#C0392B', fontSize: 13, textAlign: 'center', lineHeight: 18},
  muted: {color: '#8A8A95', fontSize: 14},
  resend: {alignItems: 'center', paddingVertical: 14},
  resendText: {color: Brand.primary, fontSize: 15, fontWeight: '700'},
  help: {textAlign: 'center', color: '#A0A0AB', fontSize: 12, lineHeight: 17},
  wrong: {textAlign: 'center', color: Brand.primary, fontSize: 14, fontWeight: '600', marginTop: 14, paddingVertical: 4},
});
