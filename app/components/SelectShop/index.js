import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import Icon, {Icons} from '@config/Icons';
import {BlurView} from '@react-native-community/blur';
import {isEmpty} from 'lodash';

const {width} = Dimensions.get('window');

const ShopSelector = ({shops, onSelect, isVisible, onClose}) => {
  console.log("shops", shops);
  const [selectedShop, setSelectedShop] = useState(null);
  const translateY = useMemo(() => new Animated.Value(500), []);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const scale = useMemo(() => new Animated.Value(1), []);

  // Reset selected shop when modal closes
  useEffect(() => {
    if (!isVisible) {
      setSelectedShop(null);
    }
  }, [isVisible]);

  // Animate bottom sheet
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 9,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 500,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, opacity, translateY]);

  const handleSelect = shop => {
    setSelectedShop(shop);

    // Animate selection
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Generate background gradient colors based on shop name with primary color influence
  const getShopColors = name => {
    const primaryColor = '#632240';

    const colorSets = [
      [primaryColor, '#FF9F43'], // Primary to orange
      [primaryColor, '#786FA6'], // Primary to purple
      ['#786FA6', primaryColor], // Purple to primary
      [primaryColor, '#63CDDA'], // Primary to teal
      ['#63CDDA', primaryColor], // Teal to primary
      ['#574B90', primaryColor], // Dark purple to primary
      [primaryColor, '#F78FB3'], // Primary to pink
    ];

    const hash = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorSets[hash % colorSets.length];
  };

  // Platform specific blur component to ensure consistency
  const renderBlurBackground = () => {
    // On Android, use a simple View with background color instead of BlurView
    if (Platform.OS === 'android') {
      return (
        <View style={[styles.blurContainer, styles.androidBlurFallback]}>
          {renderContent()}
        </View>
      );
    }

    // On iOS, use BlurView as intended
    return (
      <BlurView intensity={35} style={styles.blurContainer} tint="dark">
        {renderContent()}
      </BlurView>
    );
  };

  // Content to be rendered inside the blur container
  const renderContent = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Shop</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon
            type={Icons.Ionicons}
            name="close"
            size={24}
            color={'#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
      {shops && shops.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.shopsContainer}
          showsVerticalScrollIndicator={false}>
          {shops.map((shop, index) => {
            // Use index as fallback key if property_uid is undefined
            const shopKey = shop.property_uid || `shop-${index}`;
            const colors = getShopColors(shop.property_name);

            return (
              <TouchableOpacity
                key={shopKey}
                style={styles.shopCard}
                onLongPress={() => {
                  selectedShop && onSelect(selectedShop);
                }}
                onPress={() => handleSelect(shop)}
                activeOpacity={0.8}>
                <View
                  style={[
                    styles.shopCardInner,
                    selectedShop?.pr_id === shop.pr_id &&
                      styles.selectedShopCard,
                  ]}>
                  <View
                    style={[
                      styles.shopIconContainer,
                      {backgroundColor: colors[0]},
                    ]}>
                    <View style={styles.shopIcon}>
                      <Text style={styles.shopInitial}>
                        {shop?.property_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.shopInfo}>
                    <Text style={styles.shopName}>{shop.property_name}</Text>
                    <View style={styles.shopDetail}>
                      <Icon
                        type={Icons.MaterialIcons}
                        name="fingerprint"
                        size={16}
                        color={'rgba(255, 255, 255, 0.7)'}
                        style={{marginRight: 5}}
                      />
                      <Text style={styles.shopDetailText}>
                        {shop.property_uid?.substring(0, 8) || ''}...
                      </Text>
                    </View>
                  </View>

                  {selectedShop?.pr_id === shop.pr_id && (
                    <View style={styles.checkmarkContainer}>
                      <Icon
                        type={Icons.Entypo}
                        name="shop"
                        size={24}
                        color={'white'}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={styles.bottomPadding} />
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Icon type={Icons.Entypo} name="shop" size={50} color={'#ccc'} />
          <Text style={styles.emptyStateTitle}>No Shops Found</Text>
          <Text style={styles.emptyStateMessage}>
            You don't have any shops in your profile yet.
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          !selectedShop && styles.confirmButtonDisabled,
        ]}
        onPress={() => selectedShop && onSelect(selectedShop)}
        disabled={!selectedShop}>
        <Text style={styles.confirmButtonText}>
          Continue with Selected Shop
        </Text>
      </TouchableOpacity>
    </>
  );

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, {opacity}]}>
      <TouchableOpacity
        style={styles.overlayTouch}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        style={[
          styles.container,
          {
            transform: [{translateY}, {scale}],
          },
        ]}>
        {renderBlurBackground()}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scrollView: {
    maxHeight: 420,
  },
  bottomPadding: {
    height: 10,
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    color: 'white',
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  addShopButton: {
    backgroundColor: '#632240',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addShopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    width: '92%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    // Cross-platform shadow solution
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.6,
        shadowRadius: 18,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  // Android-specific fallback for blur
  androidBlurFallback: {
    backgroundColor: 'rgba(30, 30, 35, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    // Use platform-specific fonts for better consistency
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(238, 82, 83, 0.2)',
    borderRadius: 12,
  },
  shopsContainer: {
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  shopCard: {
    marginBottom: 16,
    borderRadius: 18,
    // Cross-platform shadow for each card
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  shopCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    // Android needs this to see the borderWidth & borderColor
    ...Platform.select({
      android: {
        overflow: 'hidden',
      },
    }),
  },
  selectedShopCard: {
    backgroundColor: 'rgba(238, 82, 83, 0.15)',
    borderColor: '#632240',
    borderWidth: 2,
  },
  shopIconContainer: {
    padding: 2,
    borderRadius: 16,
    marginRight: 16,
  },
  shopIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shopInitial: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 3,
      },
      // Android doesn't handle text shadows well, so use a different approach
      android: {
        elevation: 3,
      },
    }),
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  shopDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopDetailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  checkmarkContainer: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  confirmButton: {
    backgroundColor: '#632240',
    zIndex: 111,
    marginHorizontal: 22,
    marginVertical: 18,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    // Cross-platform shadow for button
    ...Platform.select({
      ios: {
        shadowColor: '#632240',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
        zIndex: 1111,
      },
    }),
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(238, 82, 83, 0.5)',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
});

export default ShopSelector;
