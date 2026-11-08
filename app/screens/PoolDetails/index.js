import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  FlatList
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon, {Icons} from '@config/Icons';
import CHeader from '@components/CHeader';

const {width} = Dimensions.get('window');

const PoolDetailsScreen = ({route, navigation}) => {
  const {pool} = route.params;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = [pool.image, pool.image, pool.image];

  const amenitiesData = [
    {icon: 'restaurant-outline', label: 'Kitchen'},
    {icon: 'tv-outline', label: 'TV'},
    {icon: 'man', label: 'Kids Pool'},
    {icon: 'water', label: 'Shower'},
    {icon: 'flame-outline', label: 'BBQ'},
    {icon: 'musical-notes-outline', label: 'Speaker'},
  ];

  const renderImageItem = ({item, index}) => (
    <View style={styles.imageWrapper}>
      <Image source={{uri: item}} style={styles.carouselImage} />
      <View style={styles.imageOverlay} />
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            activeImageIndex === index && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <CHeader
        hideBackBtn
        onBackPress={() => navigation.goBack()}
        mainContainerStyle={styles.header}
      />
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.iconContainer]}
        onPress={() => {
          navigation.goBack();
        }}>
        <Icon
          type={Icons.Octicons}
          name={'chevron-left'}
          style={{color:"black"}}
        />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImageIndex(Math.round(x / width));
            }}
          />
          {renderPagination()}
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.title}>{pool.name}</Text>
              <View style={styles.locationContainer}>
                <Icon
                  type={Icons.Ionicons}
                  name="location-outline"
                  size={16}
                  color="#666"
                />
                <Text style={styles.location}>{pool.location}</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Icon
                type={Icons.Ionicons}
                name="star"
                size={16}
                color="#FFD700"
              />
              <Text style={styles.rating}>{pool.rating}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Pool Information</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon
                  type={Icons.Ionicons}
                  name="resize-outline"
                  size={20}
                  color="#3B82F6"
                />
                <Text style={styles.infoLabel}>Size</Text>
                <Text style={styles.infoValue}>L 10 x W 6</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon
                  type={Icons.Ionicons}
                  name="water-outline"
                  size={20}
                  color="#3B82F6"
                />
                <Text style={styles.infoLabel}>Depth</Text>
                <Text style={styles.infoValue}>0.7-1.8 meter</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon
                  type={Icons.Ionicons}
                  name="flask-outline"
                  size={20}
                  color="#3B82F6"
                />
                <Text style={styles.infoLabel}>Water Type</Text>
                <Text style={styles.infoValue}>Chlorine</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {amenitiesData.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <View style={styles.amenityIcon}>
                    <Icon
                      type={Icons.Ionicons}
                      name={amenity.icon}
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  <Text style={styles.amenityLabel}>{amenity.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity activeOpacity={0.9}>
              <Image
                source={{uri: 'https://i.ibb.co/NZ4w8g3/image.png'}}
                style={styles.map}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.bookingSection}>
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Booking Price</Text>
                <Text style={styles.priceValue}>{pool.price}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Security Deposit</Text>
                <Text style={styles.priceValue}>20.000 BHD</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Down Payment</Text>
                <Text style={styles.priceValue}>20.000 BHD</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() =>
                Alert.alert('Success', 'Booking successfully done')
              }>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    paddingHorizontal: 15,
  },
  imageContainer: {
    position: 'relative',
  },
  imageWrapper: {
    width: width,
    height: 400,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  iconContainer: {
    height: 36,
    width: 36,
    borderRadius: 5,
    backgroundColor:"white",
    borderWidth: 1,
    top: 40,
    left: 15,
    zIndex: 1,
    position: 'absolute',
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rating: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  infoValue: {
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  amenityItem: {
    width: '33.33%',
    padding: 10,
    alignItems: 'center',
  },
  amenityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  amenityLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  map: {
    height: 200,
    width: '100%',
    borderRadius: 20,
  },
  bookingSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceBreakdown: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PoolDetailsScreen;
