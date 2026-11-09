import React, {useRef, useState} from 'react';
import {View, Text, TextInput, StyleSheet, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchableOpacity from '@components/PressableScale';
import {ResetLayout, PrimaryButton, resetApi} from '@components/ResetFlow';
import {Brand} from '@config/brand';
import {tap} from '@utils/haptics';

// Step 3: new password. Rules = exactly what the server enforces (8 to 72 characters, not your email), so a
// password this screen accepts is never refused later.
const Rule = ({ok, text}) => (
  <View style={styles.rule}>
    <Icon name={ok ? 'check-circle' : 'circle-outline'} size={16} color={ok ? '#1E7B4B' : '#B5B5BD'} />
    <Text style={[styles.ruleText, ok && {color: '#1E7B4B'}]}>{text}</Text>
  </View>
);

const PasswordField = ({value, onChangeText, placeholder, show, toggle, inputRef, onSubmit, next}) => (
  <View style={styles.field}>
    <Icon name="lock-outline" size={22} color="#8A8A95" />
    <TextInput
      ref={inputRef}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#A0A0AB"
      secureTextEntry={!show}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="newPassword"
      autoComplete="new-password"
      returnKeyType={next ? 'next' : 'done'}
      onSubmitEditing={onSubmit}
      blurOnSubmit={!next}
    />
    <TouchableOpacity onPress={toggle} hitSlop={10}>
      <Icon name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color="#8A8A95" />
    </TouchableOpacity>
  </View>
);

export default function ResetNewPassword({navigation, route}) {
  const {email, resetToken} = route.params;
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const confirmRef = useRef(null);

  const longEnough = pw.length >= 8;
  const notTooLong = pw.length <= 72;
  const notEmail = pw.trim().toLowerCase() !== email.toLowerCase();
  const match = pw.length > 0 && pw === pw2;
  const valid = longEnough && notTooLong && notEmail && match;

  const submit = async () => {
    if (!valid || loading) {
      return;
    }
    setError('');
    setLoading(true);
    const r = await resetApi('reset-password', {email, reset_token: resetToken, password: pw});
    setLoading(false);
    if (r.offline) {
      Toast.show({type: 'error', text1: "You're offline", text2: 'Connect to the internet and try again.'});
    } else if (r.ok) {
      tap('notificationSuccess');
      AsyncStorage.removeItem('reset:v1').catch(() => {});
      setDone(true);
    } else if (r.data?.code === 'RESET_TOKEN_INVALID') {
      navigation.navigate('ResetEmail', {email, notice: 'Your reset session timed out. Request a new code to continue.'});
    } else {
      setError(r.data?.msg || 'Something went wrong. Please try again.');
    }
  };

  if (done) {
    return (
      <ResetLayout title="Password updated">
        <View style={styles.doneIcon}>
          <Icon name="check-bold" size={34} color="#1E7B4B" />
        </View>
        <Text style={styles.doneText}>
          You've been signed out of all other devices. Sign in with your new password.
        </Text>
        <PrimaryButton label="Sign in" onPress={() => navigation.reset({index: 0, routes: [{name: 'Login', params: {email}}]})} />
      </ResetLayout>
    );
  }

  return (
    <ResetLayout step={3} title="Create a new password" subtitle="Use something you don't use anywhere else." onBack={() => navigation.goBack()}>
      <PasswordField value={pw} onChangeText={t => { setPw(t); setError(''); }} placeholder="New password" show={show} toggle={() => setShow(v => !v)} next onSubmit={() => confirmRef.current?.focus()} />
      <View style={{height: 12}} />
      <PasswordField inputRef={confirmRef} value={pw2} onChangeText={t => { setPw2(t); setError(''); }} placeholder="Confirm password" show={show2} toggle={() => setShow2(v => !v)} onSubmit={submit} />

      <View style={styles.rules}>
        <Rule ok={longEnough} text="At least 8 characters" />
        <Rule ok={notEmail && pw.length > 0} text="Not the same as your email" />
        <Rule ok={match} text={pw2.length > 0 && !match ? "Passwords don't match" : 'Both passwords match'} />
        {!notTooLong && <Text style={styles.error}>Use 72 characters or fewer.</Text>}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton label="Reset password" onPress={submit} disabled={!valid} loading={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Reset password</Text>}
      </PrimaryButton>
    </ResetLayout>
  );
}

const styles = StyleSheet.create({
  field: {flexDirection: 'row', alignItems: 'center', gap: 10, height: 56, borderRadius: 14, backgroundColor: '#F6F6F9', borderWidth: 1.5, borderColor: '#ECECF1', paddingHorizontal: 14},
  input: {flex: 1, color: '#1F1F24', fontSize: 16},
  rules: {marginTop: 14, marginBottom: 10, gap: 6},
  rule: {flexDirection: 'row', alignItems: 'center', gap: 8},
  ruleText: {color: '#8A8A95', fontSize: 13},
  error: {color: '#C0392B', fontSize: 13, marginVertical: 4},
  ctaText: {color: '#fff', fontSize: 17, fontWeight: '700'},
  doneIcon: {width: 76, height: 76, borderRadius: 38, backgroundColor: '#DDF5E7', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 18},
  doneText: {color: '#5A5A66', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 18},
});
