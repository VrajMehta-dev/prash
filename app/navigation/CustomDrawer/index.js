/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
// DrawerNavigator.js
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Platform,
  Text,
  View
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import _ from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '@react-navigation/native';
import Chat from '@screens/Chat';
import Profile from '@screens/Profile';
import MyTrips from '@screens/MyTrips';
import Dashboard from '@screens/Dashboard';
import CHeader from '@components/CHeader';
import CImage from '@components/CImage';
import {Images} from '@config/images';
import authActions from '@redux/reducers/auth/actions';
import {CustomIcon} from '@config/LoadIcons';
import BaseSetting from '@config/setting';
import {translate} from '@lang/Translate';
import {getApiData} from '@utils/apiHelper';
import {logout, subscriptionSlugData} from '@utils/commonFunction';
import BottomTab from '../BottomTab';
import GetStyles from './styles';
import Overlay from './overlay';
import BillsDashboard from '@components/BillBoard';
import withTabTransition from '../withTabTransition';
import withDepositGate from '../withDepositGate';
import Charges from '@screens/Charges';
import PayHub from '@screens/PayHub';
import Containers from '@screens/Containers';
import SecurityDeposit from '@screens/SecurityDeposit';
import HelpAndSupport from '@screens/HelpAndSupport';
import PropertyDocuments from '@screens/PropertyDocuments';

const DashboardTab = withTabTransition(Dashboard);
const BillsTab = withTabTransition(withDepositGate(BillsDashboard));
const ChargesTab = withTabTransition(withDepositGate(Charges));
const PayTab = withTabTransition(withDepositGate(PayHub));
const ContainersTab = withTabTransition(withDepositGate(Containers));
const HelpTab = withTabTransition(HelpAndSupport);
const DepositTab = withTabTransition(SecurityDeposit);
const DocumentsTab = withTabTransition(PropertyDocuments);
const ProfileTab = withTabTransition(Profile);

const CustomDrawer = ({navigation}) => {
  const IOS = Platform.OS === 'ios';
  const {colors} = useTheme();
  const BaseColors = colors;
  const styles = GetStyles();

  const {setVendorId, setUserData} = authActions;
  const dispatch = useDispatch();

  const {userData, notificationCount, isPurchase, subscriptionData} =
    useSelector(state => state.auth);

  const Tab = createBottomTabNavigator();

  // Reference
  const deleteAccountModalRef = useRef();
  const logoutModalRef = useRef();
  const subFeatureModalRef = useRef();
  const interstitialAdRef = useRef();

  // State Variables
  const [show, setShow] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const screenWidth = Dimensions.get('screen').width;

  const drawerList = [
    {
      id: 12,
      title: 'wallet&Transactions',
    },
    {
      id: 15,
      title: 'expenses',
    },
    {
      id: 13,
      title: 'GoTokens',
    },

    {
      id: 2,
      title: 'SponsorTrip',
    },
    {
      id: 3,
      title: 'SavedDestinations',
    },
    {
      id: 4,
      title: 'checkFlightAvailability',
    },
    {
      id: 5,
      title: 'BookHotels',
    },
    {
      id: 6,
      title: 'Events',
    },
    {
      id: 7,
      title: 'Services',
    },
    {
      id: 8,
      title: 'Subscriptions',
    },
    {
      id: 9,
      title: 'HelpSupport',
    },
    {
      id: 10,
      title: 'AppAppearance',
    },
    {
      id: 16,
      title: 'aiChatbot',
    },
    {
      id: 14,
      title: 'Translate',
    },
    {
      id: 11,
      title: 'DeleteAccount',
    },
  ];
  const {accessToken} = useSelector(state => state.auth);

  useEffect(() => {
    fetchData();
  }, [show]);
  const fetchData = async () => {
    const url = BaseSetting.baseUrl + BaseSetting.endpoints.userInfo;
    console.log('URL:', url);

    const headers = {
      // 'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };
    console.log('headers', headers);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('Raw Response:', response);

      // ✅ Handle empty response case
      const text = await response.text(); // Read response as text
      const data = text ? JSON.parse(text) : {}; // Parse if not empty
      console.log('dat4567890-', data);

      if (response.ok) {
        console.log('Response Data:', data);
        dispatch(setUserData(data));
      } else {
        console.log('Error:');
      }

      console.log('Response Data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your connection.',
      });
    }
  };

  const config = {
    animation: 'timing',
    config: {
      stiffness: 750,
      damping: 300,
      mass: 2,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  };
  let navOptions = {headerShown: false};
  if (!IOS) {
    navOptions = {
      headerShown: false,
      transitionSpec: {
        open: config,
        close: config,
      },
    };
  }

  const active = useSharedValue(false);
  const animatedStyle = useAnimatedStyle(() => {
    const duration = 250;
    return {
      transform: [
        {perspective: 500},
        {
          scale: active.value
            ? withTiming(0.8, {
                duration: duration,
              })
            : withTiming(1, {
                duration: duration,
              }),
        },
        {
          translateX: active.value
            ? withTiming(screenWidth / 1.2, {
                duration: duration,
              })
            : withTiming(0, {
                duration: duration,
              }),
        },
      ],
      borderRadius: active.value
        ? withTiming(32, {
            duration: duration,
          })
        : withTiming(0, {
            duration: duration,
          }),
    };
  });

  const closeDrawer = () => {
    setShow(false);
    active.value = false;
  };
  const openDrawer = () => {
    setShow(true);
    active.value = true;
  };

  const userName =
    !_.isEmpty(userData) && !_.isEmpty(userData?.user_name)
      ? userData?.user_name
      : '';

  const fullName =
    !_.isEmpty(userData) && !_.isEmpty(userData?.full_name)
      ? userData?.full_name
      : '';

  const profilePicture =
    !_.isEmpty(userData) && !_.isEmpty(userData?.profile_picture)
      ? userData?.profile_picture
      : null;

  return (
    <View style={{flex: 1}}>
      <View style={styles.container}>
        <View style={[styles.contentContainer]}>
          <View style={styles.profileImageAndCloseIconContainer}>
            <CImage
              src={
                'https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
              }
              style={styles.profileStyle}
            />
            <TouchableOpacity
              style={styles.drawerCloseIconBtn}
              onPress={() => {
                closeDrawer();
              }}
              activeOpacity={0.8}>
              <CustomIcon name="back" size={20} color={'white'} />
              <Text style={styles.textReturn}>{translate('Return')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fullNameText}>{fullName}</Text>
          <Text style={styles.userNameText}>@{userName || 'Vraj Mehta'}</Text>
          <FlatList
            data={drawerList}
            style={styles.drawerList}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  // disabled={}
                  onPress={() => {
                    closeDrawer();
                    if (item.id == 15) {
                      navigation?.navigate('UserExpenses');
                    } else if (item.id == 12) {
                      navigation?.navigate('Wallet');
                    } else if (item.id == 13) {
                      navigation?.navigate('Tokens');
                    } else if (item.id == 11) {
                      setTimeout(() => {
                        deleteAccountModalRef?.current?.open();
                      }, 300);
                    } else if (item.id == 14) {
                      if (!subscriptionData?.translation) {
                        subFeatureModalRef?.current?.open();
                      } else {
                        navigation?.navigate('Translate');
                      }
                    } else if (item.id == 16) {
                      if (!subscriptionData?.aiChatBot) {
                        subFeatureModalRef?.current?.open();
                      } else {
                        navigation?.navigate('ChatBot');
                      }
                    } else if (item.id == 1) {
                      const tempVendorId =
                        !_.isEmpty(userData?.vendor_id) &&
                        !_.isUndefined(userData?.vendor_id) &&
                        !_.isNull(userData?.vendor_id)
                          ? userData?.vendor_id
                          : '';
                      dispatch(setVendorId(tempVendorId));
                      if (
                        userData?.is_vendor &&
                        (userData?.is_vendor_status == 1 ||
                          userData?.is_vendor_status == 2)
                      ) {
                        navigation?.navigate('MyServices');
                      } else {
                        if (!subscriptionData?.becomeVendor) {
                          subFeatureModalRef?.current?.open();
                        } else {
                          if (isPurchase) {
                            navigation?.navigate('BecomeVendor');
                          } else {
                            interstitialAdRef?.current?.open(() => {
                              navigation?.navigate('BecomeVendor');
                            });
                          }
                        }
                      }
                    } else if (item.id == 2) {
                      navigation?.navigate('MyTrip', {isSponsored: true});
                    } else if (item.id == 3) {
                      navigation?.navigate('SaveDestination');
                    } else if (item.id == 6) {
                      if (isPurchase) {
                        navigation?.navigate('Events');
                      } else {
                        interstitialAdRef?.current?.open(() => {
                          navigation?.navigate('Events');
                        });
                      }
                    } else if (item.id == 7) {
                      if (!subscriptionData?.services) {
                        subFeatureModalRef?.current?.open();
                      } else {
                        navigation?.navigate('Services');
                      }
                    } else if (item.id == 8) {
                      navigation?.navigate('Subscriptions');
                    } else if (item.id == 9) {
                      navigation?.navigate('HelpAndSupport');
                    } else if (item.id == 10) {
                      navigation?.navigate('AppAppearance');
                    } else if (item.id == 4) {
                      if (isPurchase) {
                        Toast.show({
                          type: 'info',
                          text2: 'Coming Soon!',
                        });
                      } else {
                        interstitialAdRef?.current?.open(() => {
                          Toast.show({
                            type: 'info',
                            text2: 'Coming Soon!',
                          });
                        });
                      }
                    } else {
                      Toast.show({
                        type: 'info',
                        text2: 'Coming Soon!',
                      });
                    }
                  }}
                  key={index}>
                  <Text
                    style={styles.drawerTabText(
                      index == drawerList.length - 1,
                    )}>
                    {translate(item?.title)}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={item => item?.id}
          />
          <View style={styles.versionContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                closeDrawer();
                logout();
              }}
              style={styles.logoutContainer}>
              <Text style={styles.logout}>{translate('Logout')}</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>{translate('Version')} 2.0.1</Text>
          </View>
        </View>
      </View>
      <Animated.View style={[styles.root, animatedStyle]}>
        <Tab.Navigator
          tabBar={props => (
            <View style={styles.tabBarContainer}>
              <BottomTab {...props} />
            </View>
          )}
          sceneContainerStyle={{borderRadius: 20}}
          initialRouteName={'Dashboard'}
          backBehavior={'initialRoute'}>
          <Tab.Screen
            name="Dashboard"
            options={navOptions}
            component={DashboardTab}
          />

          <Tab.Screen
            name="Bills"
            options={navOptions}
            component={BillsTab}
          />
          <Tab.Screen
            name="Charges"
            options={navOptions}
            component={ChargesTab}
          />
          <Tab.Screen name="Pay" options={navOptions} component={PayTab} />
          <Tab.Screen
            name="Containers"
            options={navOptions}
            component={ContainersTab}
          />
          <Tab.Screen name="HelpAndSupport" options={navOptions} component={HelpTab} />
          <Tab.Screen name="SecurityDeposit" options={navOptions} component={DepositTab} />
          <Tab.Screen name="PropertyDocuments" options={navOptions} component={DocumentsTab} />
          <Tab.Screen name="Profile" component={ProfileTab} options={navOptions} />
        </Tab.Navigator>
      </Animated.View>
      <Overlay active={active} onPress={closeDrawer} />
    </View>
  );
};

export default CustomDrawer;
