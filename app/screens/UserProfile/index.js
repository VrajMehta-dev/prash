/* eslint-disable react-native/no-inline-styles */
import TripCard from '@components/TripCard';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PostCard from '@components/PostCard';
import {useSelector} from 'react-redux';
import {
  useFocusEffect,
  useIsFocused,
  useRoute,
  useTheme,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {getApiData, getApiDataProgress} from '@utils/apiHelper';
import BaseSetting from '@config/setting';
import {AnimatedScrollView} from 'react-native-reanimated/lib/typescript/component/ScrollView';
import AnimatedView from '@components/AnimatedView';
import {translate} from '@lang/Translate';
const UserProfile = ({navigation}) => {
  const {userData} = useSelector(state => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [tripList, setTripList] = useState(null);
  const [followLoader, setFollowLoader] = useState(false);
  console.log('profileData', profileData);

  const [btnLoader, setBtnLoader] = useState(null);
  const route = useRoute();
  console.log('route', route);
  useEffect(() => {
    getUserProfile(userId);
    console.log('userId', userId);
  }, [userId]);
  useEffect(() => {
    getTripList(userId);
    console.log('userId', userId);
  }, [userId]);
  useEffect(() => {
    setIsFollowing(profileData?.is_following);
  }, [profileData?.is_following]);

  const userId = route?.params?.user;
  const profile = {
    name: 'ibrahim',
    avatar:
      'https://i.pinimg.com/originals/ee/ed/5b/eeed5b8447e7e04eda173df11a8ee30a.jpg',
    stats: {
      followers: 2,
      following: 4,
      totalPosts: 3,
      tripsPlanned: 4,
      tripsCompleted: 1,
    },
    trips: [
      {
        id: 1,
        title: 'Trip to Newark',
        date: '30/04/2024 - 09/05/2024',
        location: 'Newark, NJ',
        image:
          'https://i.pinimg.com/originals/ee/ed/5b/eeed5b8447e7e04eda173df11a8ee30a.jpg',
        status: 'completed',
      },
      {
        id: 1,
        title: 'Trip to Newark',
        date: '30/04/2024 - 09/05/2024',
        location: 'Newark, NJ',
        image:
          'https://i.pinimg.com/originals/ee/ed/5b/eeed5b8447e7e04eda173df11a8ee30a.jpg',
        status: 'completed',
      },
    ],
  };
  async function getTripList(id, type) {
    try {
      if (type !== 'background') {
        // setBtnLoader(true);
      }

      const endpoint = `${BaseSetting.endpoints.tripList}?user_id=${id}`;
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
        // setBtnLoader(false);
      }
    } catch (er) {
      console.log('er=======', er);
      // setBtnLoader(false);
    }
  }
  async function getUserProfile(id, type) {
    try {
      if (type !== 'background') {
        setBtnLoader(true);
      }

      const endpoint = `${BaseSetting.endpoints.userProfile}?user_id=${id}`;
      const response = await getApiData(endpoint, 'GET');
      console.log('response', JSON.stringify(response));

      if (response?.status) {
        setProfileData(response?.data);
        setTimeout(() => {
          setBtnLoader(false);
        }, 1000);
      } else {
        Toast.show({
          type: 'error',
          //   text1: translate('error'),
          text2: response?.message,
        });
        setBtnLoader(false);
      }
    } catch (er) {
      console.log('er=======', er);
      setBtnLoader(false);
    }
  }
  // Current User (who is interacting with the post)
  const currentUser = {
    avatar: userData?.image,
    name: userData?.name,
  };

  const [isFollowing, setIsFollowing] = useState(
    profileData?.is_following || false,
  );

  const handleToggle = type => {
    setIsFollowing(!isFollowing);
    FollowUser(profileData?.id, type);
  };
  // Function to handle the "Next" button press and make an API call
  const LikePost = async postId => {
    try {
      const data = {
        'TravelPostsLike[post_id]': postId,
        'TravelPostsLike[user_id]': userData?.id,
      };
      const endpoint = BaseSetting.endpoints.likePost;
      const result = await getApiDataProgress(endpoint, 'POST', data);
      console.log('result', result);
      if (result?.status) {
        getUserProfile(userId, 'background');
        Toast.show({
          type: 'success',
          text1: 'Great!',
          text2: result?.message,
        });
      } else {
        // API call failed, display an error message
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result?.message,
        });
      }
    } catch (error) {
      // Handle API call error
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message,
      });
    }
  };

  const socketObj = useSelector(state => state.socket?.socketObj);

  const addConversation = () => {
    if (socketObj !== null) {
      const obj = {
        sender_id: userData?.id,
        receiver_id: userId,
      };
      socketObj.emit('createConversation', obj, userRequestList => {
        if (userRequestList?.status) {
          navigation.navigate('Chat');
        } else {
          console.log('sendMsgStatus');
        }
      });
    } else {
      console.log('Error');
    }
  };
  // Function to FollowUser
  const FollowUser = async (followerId, type) => {
    setFollowLoader(true);
    try {
      const data = {
        'UserFollows[follower_id]': userData?.id,
        'UserFollows[followed_id]': followerId,
        'UserFollows[type]': type ? 'un-follow' : 'follow',
      };
      const endpoint = BaseSetting.endpoints.followRequest;
      const result = await getApiDataProgress(endpoint, 'POST', data);
      console.log('data', data);
      console.log('result', result);

      if (result?.status) {
        Toast.show({
          type: 'success',
          text1: 'Error',
          text2: result?.message,
        });
        getUserProfile(userId, 'background');
        setFollowLoader(false);
      } else {
        setFollowLoader(false);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result?.message,
        });
      }
    } catch (error) {
      setFollowLoader(false);

      // Handle API call error
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message,
      });
    }
  };
  return btnLoader ? (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size={'large'} color={'#333366'} />
    </View>
  ) : (
    <ScrollView style={styles.container}>
      <AnimatedView>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backButton}>
            <Icon name="chevron-left" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="dots-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image style={styles.avatar} src={profileData?.photo} />
          </View>
          <Text style={styles.username}>{profileData?.name}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {profileData?.follower_count || 0}
            </Text>
            <Text style={styles.statLabel}>{translate('followers')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {profileData?.following_count || 0}
            </Text>
            <Text style={styles.statLabel}>{translate('following')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {profileData?.post_count || 0}
            </Text>
            <Text style={styles.statLabel}> {translate('totalPosts')}</Text>
          </View>
        </View>

        {/* Trips Stats */}
        <View style={styles.tripStats}>
          <View style={styles.tripStatItem}>
            <Ionicons name="airplane" size={24} color="#4CAF50" />
            <Text style={styles.tripStatNumber}>
              {profileData?.planned_trip_count || 0}
            </Text>
            <Text style={styles.tripStatLabel}>
              {' '}
              {translate('tripsPlanned')}
            </Text>
          </View>
          <View style={styles.tripStatItem}>
            <AntIcon name="checkcircle" size={24} color="#FFC107" />
            <Text style={styles.tripStatNumber}>
              {profileData?.completed_trip_count || 0}
            </Text>
            <Text style={styles.tripStatLabel}>
              {translate('tripsCompleted')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => {
              if (isFollowing) {
                addConversation();
              }
            }}>
            <Icon name="lock-outline" size={20} color="#333366" />
            <Text style={styles.messageButtonText}>
              {translate('message').toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleToggle(profileData?.is_following);
            }}
            style={!isFollowing ? styles.followButton : styles.unfollowButton}>
            {followLoader ? (
              <ActivityIndicator color={'#fff'} />
            ) : (
              <Text style={styles.followButtonText}>
                {isFollowing ? translate('unfollow') : translate('follow')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Trips Section */}
        <View style={styles.tripsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{profileData?.name}'s Trips</Text>
            <Icon name="information" size={24} color="#333366" />
          </View>

          <FlatList
            horizontal
            data={tripList}
            keyExtractor={item => item?.id?.toString()}
            renderItem={({item}) => {
              return (
                <View style={{margin: 10}}>
                  <TripCard
                    title={item.title}
                    imageUri={item.thumbnail_image}
                    dateRange={`${item?.check_in_date} - ${item?.check_out_date}`}
                    location={item?.destination}
                    desc={item?.description}
                    status= {item.payment_status === 'pending' ? 'Ongoing' : 'Completed'}
                  />
                </View>
              );
            }}
          />
        </View>
        <View style={styles.tripsSection}>
          {/* Posts Section */}
          <View style={styles.postsSection}>
            <Text style={styles.sectionTitle}>{profileData?.name}'s Posts</Text>
            <FlatList
              data={profileData?.posts}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => {
                return (
                  <PostCard
                    currentUser={currentUser}
                    key={item.id}
                    post={item}
                    onLikePress={id => {
                      LikePost(id);
                    }}
                    onCommentSend={(id, comment) => {
                      getUserProfile(userId, 'background');
                    }}
                  />
                );
              }}
            />
          </View>
        </View>
      </AnimatedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },

  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#666',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 20,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#333366',
    flex: 1,
    maxWidth: 160,
    gap: 8,
  },
  messageButtonText: {
    color: '#333366',
    fontSize: 14,
    fontWeight: '600',
  },
  followButton: {
    backgroundColor: '#000033',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    maxWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unfollowButton: {
    backgroundColor: '#333366',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    maxWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  tripStatItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tripStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  tripStatLabel: {
    color: '#666',
    fontSize: 12,
  },
  tripsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  postsSection: {
    marginBottom: 80,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tripImage: {
    width: '100%',
    height: 150,
  },
  tripInfo: {
    padding: 15,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tripDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  tripDate: {
    marginLeft: 8,
    color: '#666',
  },
  tripLocation: {
    marginLeft: 8,
    color: '#666',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default UserProfile;
