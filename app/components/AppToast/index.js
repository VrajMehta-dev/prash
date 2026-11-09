import React from 'react';
import {View, Text, StyleSheet, Platform, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';

// Toasts in the same visual language as the rest of the app: a white rounded card that floats below the status bar,
// a tinted icon circle, a bold title and a softer message. Used for success / error / info via react-native-toast-message.
const KINDS = {
  success: {icon: 'check-circle-outline', fg: '#1E7B4B', bg: '#DDF5E7', title: 'Done'},
  error: {icon: 'alert-circle-outline', fg: '#C0392B', bg: '#FBE4E1', title: 'Something went wrong'},
  info: {icon: 'information-outline', fg: Brand.primary, bg: '#F6EEF2', title: 'Heads up'},
};

// Distance from the top of the screen: below the status bar / notch.
export const TOAST_TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 10;

const ToastCard = ({kind, text1, text2, onPress}) => {
  const k = KINDS[kind];
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={[styles.iconWrap, {backgroundColor: k.bg}]}>
        <Icon name={k.icon} size={22} color={k.fg} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={2}>
          {text1 || k.title}
        </Text>
        {!!text2 && (
          <Text style={styles.message} numberOfLines={3}>
            {text2}
          </Text>
        )}
      </View>
      <View style={[styles.accent, {backgroundColor: k.fg}]} />
    </Wrapper>
  );
};

export const appToastConfig = {
  success: p => <ToastCard kind="success" {...p} />,
  error: p => <ToastCard kind="error" {...p} />,
  info: p => <ToastCard kind="info" {...p} />,
};

const styles = StyleSheet.create({
  card: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 16,
    overflow: 'hidden',
    shadowColor: '#1B1230',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  iconWrap: {width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  texts: {flex: 1},
  title: {color: '#17171C', fontSize: 15, fontWeight: '700', lineHeight: 20},
  message: {color: '#6B6B76', fontSize: 13, lineHeight: 18, marginTop: 2},
  accent: {position: 'absolute', left: 0, top: 14, bottom: 14, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3},
});
