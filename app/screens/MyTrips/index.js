/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  FlatList
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'react-native-linear-gradient';
import BaseSetting from '@config/setting';
import {useSelector} from 'react-redux';
import {getApiData} from '@utils/apiHelper';
import Toast from 'react-native-toast-message';

const {width} = Dimensions.get('window');

const TripScreen = () => {
  const [activeTab, setActiveTab] = useState('Active');
  const [tripList, setTripList] = useState([]);
  const [slideAnim] = useState(new Animated.Value(0));
  const {userData} = useSelector(state => state.auth);

  useEffect(() => {
    getTripList();
  }, []);

  async function getTripList() {
    try {
      const endpoint = `${BaseSetting.endpoints.tripList}?user_id=${userData?.id}`;
      const response = await getApiData(endpoint, 'GET');
      console.log('responsexxx', JSON.stringify(response));

      if (response?.status) {
        setTripList(response?.data);
      } else {
        Toast.show({
          type: 'error',
          text2: response?.message,
        });
        setTripList([]);
      }
    } catch (er) {
      console.log('Error fetching trips:', er);
    }
  }

  const handleTabChange = tab => {
    setActiveTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === 'Active' ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const TabButton = ({title, isActive}) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={() => handleTabChange(title)}>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const TripCard = ({trip}) => (
    <Animated.View style={styles.tripCard}>
      <View style={styles.imageContainer}>
        <Image source={{uri: trip.thumbnail_image}} style={styles.tripImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={16} color="#FFF" />
            <Text style={styles.locationText}>{trip.destination}</Text>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.tripContent}>
        <View style={styles.dateContainer}>
          <Icon name="calendar-range" size={16} color="#666" />
          <Text style={styles.dateText}>
            {trip.check_in_date} - {trip.check_out_date}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Planning Progress</Text>
            <Text style={styles.progressPercentage}>
              {trip.progress || 100}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#6B4EFF', '#9747FF']}
              style={[styles.progressFill, {width: `${trip.progress}%`}]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil" size={18} color="#6B4EFF" />
            <Text style={styles.editButtonText}>EDIT TRIP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton}>
            <Icon name="close" size={18} color="#FF4B4B" />
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const filteredTrips = tripList.filter(
    trip => trip.trip_status.toLowerCase() === activeTab.toLowerCase(),
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8F9FA', '#FFF']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Trips</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Icon name="calendar" size={24} color="#6B4EFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.tabContainer}>
          <TabButton title="Active" isActive={activeTab === 'Active'} />
          <TabButton title="Past" isActive={activeTab === 'Past'} />
          <Animated.View
            style={[
              styles.tabSlider,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, width / 2 - 20],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <ScrollView
          style={styles.tripList}
          showsVerticalScrollIndicator={false}>
          {filteredTrips.length === 0 ? (
            <Text style={styles.noDataText}>No trips available</Text>
          ) : (
            <FlatList
              data={filteredTrips}
              keyExtractor={item => item.id}
              renderItem={({item}) => <TripCard trip={item} />}
              showsVerticalScrollIndicator={false}
            />
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  calendarButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#F0EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#6B4EFF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 30,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25,
    zIndex: 1,
  },
  activeTabButton: {
    backgroundColor: 'transparent',
  },
  tabSlider: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    height: 40,
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: '#6B4EFF',
    fontWeight: '700',
  },
  tripList: {
    padding: 20,
  },
  tripCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  tripImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  tripTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  tripContent: {
    padding: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 12,
  },
  dateText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#6B4EFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F0EDFF',
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
    elevation: 1,
  },
  editButtonText: {
    color: '#6B4EFF',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 13,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFEDED',
    borderRadius: 12,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    elevation: 1,
  },
  cancelButtonText: {
    color: '#FF4B4B',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 13,
  },
});

export default TripScreen;
