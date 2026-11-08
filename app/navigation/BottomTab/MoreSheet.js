import React from 'react';
import {Modal, View, Text, Pressable, StyleSheet, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';
import {tap} from '@utils/haptics';

const ITEMS = [
  {name: 'Containers', icon: 'package-variant-closed', title: 'Container Charges', sub: 'Containers and their charges'},
  {name: 'SecurityDeposit', icon: 'shield-check-outline', title: 'Security Deposit', sub: 'Status and payment'},
  {name: 'Profile', icon: 'account-outline', title: 'Account', sub: 'Details, bank, documents, help'},
];

export default function MoreSheet({visible, onClose, onGo}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grab} />
        <Text style={styles.title}>More</Text>
        {ITEMS.map(it => (
          <TouchableOpacity key={it.name} activeOpacity={0.85} onPress={() => (tap(), onGo(it.name))} style={styles.row}>
            <View style={styles.icon}>
              <Icon name={it.icon} size={22} color={Brand.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.rowTitle}>{it.title}</Text>
              <Text style={styles.rowSub}>{it.sub}</Text>
            </View>
            <Icon name="chevron-right" size={22} color="#B5B5BD" />
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(20,10,30,0.4)'},
  sheet: {backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 18, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 36 : 24},
  grab: {alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDD', marginBottom: 12},
  title: {fontSize: 18, fontWeight: 'bold', color: '#17171C', marginBottom: 6},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12},
  icon: {width: 44, height: 44, borderRadius: 14, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  rowTitle: {fontSize: 15, fontWeight: '700', color: '#17171C'},
  rowSub: {fontSize: 12, color: '#8A8A95', marginTop: 2},
});
