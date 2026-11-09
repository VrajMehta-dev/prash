import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableOpacity from '@components/PressableScale';
import {useHeaderTop} from '@components/ScreenHeader';
import {Brand} from '@config/brand';
import BaseSetting from '@config/setting';
import {tap} from '@utils/haptics';

// Shared pieces of the 3-step password reset (ResetEmail -> ResetCode -> ResetNewPassword).

// The reset code is 4 digits (the server is told so; the old app, which cannot, still gets 6).
export const OTP_LENGTH = 4;

export async function resetApi(path, body) {
  try {
    const res = await fetch(BaseSetting.baseUrl + 'client/' + path, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify(body),
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {}
    return {ok: res.ok, status: res.status, data, offline: false};
  } catch (e) {
    return {ok: false, status: 0, data: {}, offline: true};
  }
}

export const fmtClock = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Seconds left until `deadline` (ms timestamp), ticking every second.
export function useSecondsLeft(deadline) {
  const calc = () => Math.max(0, Math.ceil(((deadline || 0) - Date.now()) / 1000));
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [deadline]);
  return left;
}

export function ResetLayout({step, title, subtitle, onBack, children}) {
  const top = useHeaderTop();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={[Brand.gradientTop, Brand.gradientBottom]} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={[styles.scroll, {paddingTop: top}]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          {!!onBack && (
            <TouchableOpacity onPress={onBack} style={styles.back} accessibilityLabel="Back">
              <Icon name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={styles.wordmark}>{Brand.name}</Text>
          <View style={{width: 40}} />
        </View>

        <View style={styles.card}>
          {!!step && (
            <>
              <View style={styles.steps}>
                {[1, 2, 3].map(n => (
                  <View key={n} style={[styles.pill, n <= step && styles.pillOn]} />
                ))}
              </View>
              <Text style={styles.stepText}>{`Step ${step} of 3`}</Text>
            </>
          )}
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Six boxes driven by ONE hidden input, so paste and the OS one-time-code autofill both just work.
export function OtpBoxes({value, onChange, onComplete, hasError, errorKey, editable = true, autoFocus = true}) {
  const input = useRef(null);
  const shake = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!errorKey) {
      return;
    }
    Animated.sequence(
      [10, -10, 8, -8, 4, 0].map(v => Animated.timing(shake, {toValue: v, duration: 55, useNativeDriver: true})),
    ).start();
    input.current?.focus();
  }, [errorKey]);

  const set = text => {
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(digits);
    if (digits.length === OTP_LENGTH) {
      onComplete?.(digits);
    }
  };

  return (
    <Animated.View style={{transform: [{translateX: shake}]}}>
      <View style={styles.boxes}>
        {Array.from({length: OTP_LENGTH}, (_, i) => {
          const active = focused && editable && (value.length === i || (value.length === OTP_LENGTH && i === OTP_LENGTH - 1));
          return (
            <View key={i} style={[styles.box, active && styles.boxActive, hasError && styles.boxError]}>
              <Text style={styles.boxText}>{value[i] || ''}</Text>
            </View>
          );
        })}
        <TextInput
          ref={input}
          value={value}
          onChangeText={set}
          editable={editable}
          autoFocus={autoFocus}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          caretHidden
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.hiddenInput}
          accessibilityLabel="4-digit code"
        />
      </View>
    </Animated.View>
  );
}

export const PrimaryButton = ({label, onPress, loading, disabled, children}) => (
  <TouchableOpacity
    activeOpacity={0.9}
    disabled={disabled || loading}
    onPress={() => {
      tap();
      onPress();
    }}
    style={[styles.cta, (disabled || loading) && styles.ctaOff]}>
    {children || <Text style={styles.ctaText}>{label}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Brand.gradientBottom},
  scroll: {flexGrow: 1, paddingHorizontal: 20, paddingBottom: 36},
  topRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18},
  back: {width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center'},
  wordmark: {color: '#fff', fontSize: 22, fontFamily: Brand.wordmarkFont, letterSpacing: Brand.wordmarkSpacing},
  card: {backgroundColor: '#fff', borderRadius: 26, paddingHorizontal: 22, paddingVertical: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.18, shadowRadius: 18, elevation: 8},
  steps: {flexDirection: 'row', gap: 6},
  pill: {flex: 1, height: 4, borderRadius: 2, backgroundColor: '#ECECF1'},
  pillOn: {backgroundColor: Brand.primary},
  stepText: {color: '#8A8A95', fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 14},
  title: {color: '#1F1F24', fontSize: 25, fontWeight: '700'},
  subtitle: {color: '#7A7A85', fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 20},
  boxes: {flexDirection: 'row', justifyContent: 'center', gap: 14},
  box: {width: 60, height: 64, borderRadius: 12, backgroundColor: '#F6F6F9', borderWidth: 1.5, borderColor: '#ECECF1', alignItems: 'center', justifyContent: 'center'},
  boxActive: {borderColor: Brand.primary, backgroundColor: '#fff'},
  boxError: {borderColor: '#C0392B', backgroundColor: '#FDF3F2'},
  boxText: {fontSize: 28, fontWeight: '700', color: '#1F1F24'},
  hiddenInput: {...StyleSheet.absoluteFillObject, opacity: 0.02, color: 'transparent'},
  cta: {height: 54, borderRadius: 14, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8},
  ctaOff: {opacity: 0.5},
  ctaText: {color: '#fff', fontSize: 17, fontWeight: '700'},
});
