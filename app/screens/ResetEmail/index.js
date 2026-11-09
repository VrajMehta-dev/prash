import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, StyleSheet, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchableOpacity from '@components/PressableScale';
import {ResetLayout, PrimaryButton, resetApi} from '@components/ResetFlow';
import {Brand} from '@config/brand';
import {tap} from '@utils/haptics';

const KEY = 'reset:v1';
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Step 1: ask for the code. The request is real (the old screen faked a success and sent the mail from the next one).
export default function ResetEmail({navigation, route}) {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(null); // a code requested in the last few minutes (app was closed mid-flow)
  const notice = route?.params?.notice;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        const s = raw ? JSON.parse(raw) : null;
        if (s?.email && Date.now() - s.sentAt < 5 * 60 * 1000) {
          setResume(s);
          setEmail(prev => prev || s.email);
        }
      })
      .catch(() => {});
  }, []);

  const goToCode = (mail, expiresIn, resendIn) =>
    navigation.navigate('ResetCode', {email: mail, expiresIn, resendIn});

  const send = async () => {
    const mail = email.trim().toLowerCase();
    if (!mail) {
      setError('Enter your email address.');
      return;
    }
    if (!isEmail(mail)) {
      setError("That doesn't look like an email. Check for typos.");
      return;
    }
    setError('');
    setLoading(true);
    const r = await resetApi('request-password-reset', {email: mail});
    setLoading(false);
    if (r.offline) {
      Toast.show({type: 'error', text1: "You're offline", text2: 'Connect to the internet and try again.'});
      return;
    }
    if (r.ok) {
      AsyncStorage.setItem(KEY, JSON.stringify({email: mail, sentAt: Date.now()})).catch(() => {});
      Toast.show({type: 'success', text1: "If this email is registered, we've sent a code."});
      goToCode(mail, r.data.expires_in || 300, r.data.resend_in || 60);
    } else if (r.data?.code === 'RESEND_COOLDOWN') {
      // a code went out a moment ago: take them to the entry screen instead of dead-ending
      Toast.show({type: 'info', text1: 'A code was sent a moment ago', text2: 'Enter it, or wait to request a new one.'});
      goToCode(mail, 300, r.data.retry_after || 60);
    } else {
      setError(r.data?.msg || 'Something went wrong. Please try again.');
    }
  };

  return (
    <ResetLayout
      step={1}
      title="Reset your password"
      subtitle="Enter the email linked to your PRASH account. We'll send you a 6-digit code."
      onBack={() => navigation.goBack()}>
      {!!notice && (
        <View style={styles.notice}>
          <Icon name="information-outline" size={18} color="#9A5B00" />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}
      <View style={[styles.field, !!error && styles.fieldError]}>
        <Icon name="email-outline" size={22} color="#8A8A95" />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={t => {
            setEmail(t);
            setError('');
          }}
          placeholder="Email address"
          placeholderTextColor="#A0A0AB"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="go"
          onSubmitEditing={send}
        />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton label="Send code" onPress={send} loading={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Send code</Text>}
      </PrimaryButton>

      {resume && !loading && (
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            tap();
            const left = Math.max(30, 300 - Math.round((Date.now() - resume.sentAt) / 1000));
            goToCode(resume.email, left, Math.max(0, 60 - Math.round((Date.now() - resume.sentAt) / 1000)));
          }}>
          <Text style={styles.linkText}>I already have a code</Text>
        </TouchableOpacity>
      )}

      <View style={styles.googleHint}>
        <Text style={styles.hintText}>Use a Gmail account? </Text>
        <Text style={[styles.hintText, styles.hintLink]} onPress={() => navigation.navigate('Login')}>
          Sign in with Google instead
        </Text>
      </View>
      <Text style={styles.back} onPress={() => navigation.navigate('Login')}>
        Back to sign in
      </Text>
    </ResetLayout>
  );
}

const styles = StyleSheet.create({
  field: {flexDirection: 'row', alignItems: 'center', gap: 10, height: 56, borderRadius: 14, backgroundColor: '#F6F6F9', borderWidth: 1.5, borderColor: '#ECECF1', paddingHorizontal: 14},
  fieldError: {borderColor: '#C0392B', backgroundColor: '#FDF3F2'},
  input: {flex: 1, color: '#1F1F24', fontSize: 16},
  error: {color: '#C0392B', fontSize: 13, marginTop: 8, marginLeft: 4},
  ctaText: {color: '#fff', fontSize: 17, fontWeight: '700'},
  link: {alignItems: 'center', paddingVertical: 14},
  linkText: {color: Brand.primary, fontSize: 15, fontWeight: '700'},
  googleHint: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 14},
  hintText: {color: '#8A8A95', fontSize: 13},
  hintLink: {color: Brand.primary, fontWeight: '700', textDecorationLine: 'underline'},
  back: {textAlign: 'center', color: '#8A8A95', fontSize: 14, marginTop: 14, paddingVertical: 6},
  notice: {flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: '#FFF6E3', borderRadius: 12, padding: 12, marginBottom: 14},
  noticeText: {flex: 1, color: '#7A4D00', fontSize: 13, lineHeight: 18},
});
