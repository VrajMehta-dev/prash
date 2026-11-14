import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  PanResponder,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Brand} from '@config/brand';
import {tap} from '@utils/haptics';

// One outlet row. Springs down on press and back up on release (physics, not a fade).
const ShopRow = ({shop, selected, onPress}) => {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));
  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96, {damping: 14, stiffness: 400});
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {damping: 8, stiffness: 300});
      }}
      onPress={onPress}>
      <Animated.View style={[styles.row, selected && styles.rowSelected, style]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(shop?.property_name || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.name} numberOfLines={1}>
            {shop?.property_name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {shop?.zone_name || ''}
          </Text>
        </View>
        {selected ? (
          <Icon name="check-circle" size={24} color={Brand.primary} />
        ) : (
          <Icon name="circle-outline" size={24} color="#C9C9D2" />
        )}
      </Animated.View>
    </Pressable>
  );
};

// Bottom sheet that springs up and can be flicked away. Only used when a tenant has several outlets.
const ShopSelector = ({shops, selectedId, onSelect, isVisible, onClose}) => {
  const {height} = useWindowDimensions();
  const list = Array.isArray(shops) ? shops : [];
  const ty = useSharedValue(height);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      ty.value = height;
      ty.value = withSpring(0, {damping: 18, stiffness: 190, mass: 0.9});
    } else if (mounted) {
      ty.value = withTiming(height, {duration: 220}, done => {
        if (done) {
          runOnJS(setMounted)(false);
        }
      });
    }
  }, [isVisible]);

  // Drag the handle/header down to dismiss; releasing springs it back or flings it away.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          ty.value = Math.max(0, g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 110 || g.vy > 0.9) {
            onClose?.();
          } else {
            ty.value = withSpring(0, {damping: 16, stiffness: 220});
          }
        },
      }),
    [onClose],
  );

  const sheetStyle = useAnimatedStyle(() => ({transform: [{translateY: ty.value}]}));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ty.value, [0, height], [1, 0]),
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sheet, {maxHeight: height * 0.7}, sheetStyle]}>
          {/* the spring overshoots upward on open: this skirt keeps the sheet's colour under it so the screen behind never shows through */}
          <View pointerEvents="none" style={styles.skirt} />
          <View {...pan.panHandlers}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={{flex: 1}}>
                <Text style={styles.title}>Choose outlet</Text>
                <Text style={styles.subtitle}>
                  Bills and charges are shown for the outlet you pick.
                </Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => {
                  tap();
                  onClose?.();
                }}
                style={styles.close}>
                <Icon name="close" size={20} color="#4A4A55" />
              </Pressable>
            </View>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}>
            {list.map((shop, i) => (
              <ShopRow
                key={shop.pr_id ?? shop.property_uid ?? i}
                shop={shop}
                selected={selectedId != null && selectedId === shop.pr_id}
                onPress={() => {
                  tap();
                  onSelect?.(shop);
                }}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,10,25,0.5)'},
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  skirt: {position: 'absolute', left: 0, right: 0, top: '100%', height: 400, backgroundColor: '#fff'},
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DADAE2',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: {fontSize: 20, fontWeight: 'bold', color: '#17171C'},
  subtitle: {fontSize: 13, color: '#7A7A85', marginTop: 3},
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8, gap: 10},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#F7F7FA',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rowSelected: {backgroundColor: '#FBF5F8', borderColor: Brand.primary},
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#F1E4EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: 20, fontWeight: 'bold', color: Brand.primary},
  rowBody: {flex: 1},
  name: {fontSize: 16, fontWeight: '700', color: '#17171C'},
  meta: {fontSize: 12, color: '#8A8A95', marginTop: 3},
});

export default ShopSelector;
