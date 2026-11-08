import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableOpacity from '@components/PressableScale';
import {Brand} from '@config/brand';
import {tap} from '@utils/haptics';

const ITEMS = [
  {name: 'Containers', icon: 'package-variant-closed', title: 'Container Charges', sub: 'Containers and their charges'},
  {name: 'SecurityDeposit', icon: 'shield-check-outline', title: 'Security Deposit', sub: 'Status and payment'},
  {name: 'PropertyDocuments', icon: 'file-sign', title: 'Shop Documents', sub: 'Rental contract and FSSAI licence'},
  {name: 'Profile', icon: 'account-outline', title: 'Account', sub: 'Details, bank, documents, help'},
];

export default function MoreSheet({visible, onClose, onGo}) {
  const ref = useRef();
  useEffect(() => {
    if (visible) ref.current?.open();
    else ref.current?.close();
  }, [visible]);
  return (
    <RBSheet
      ref={ref}
      draggable
      dragOnContent
      onClose={onClose}
      height={ITEMS.length * 68 + 90}
      customStyles={{
        container: styles.sheet,
        wrapper: {backgroundColor: 'rgba(20,10,30,0.4)'},
        draggableIcon: styles.grab,
      }}>
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
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 18, paddingBottom: Platform.OS === 'ios' ? 36 : 24},
  grab: {width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDD'},
  title: {fontSize: 18, fontWeight: 'bold', color: '#17171C', marginBottom: 6},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12},
  icon: {width: 44, height: 44, borderRadius: 14, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  rowTitle: {fontSize: 15, fontWeight: '700', color: '#17171C'},
  rowSub: {fontSize: 12, color: '#8A8A95', marginTop: 2},
});
