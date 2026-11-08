/* eslint-disable react/no-unstable-nested-components */
import DeviceInfo from 'react-native-device-info';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
  Linking,
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import {isEmpty, set} from 'lodash';
import BaseSetting from '@config/setting';
import {logout} from '@utils/commonFunction';
import Toast from 'react-native-toast-message';
import authActions from '@redux/reducers/auth/actions';
import {store} from '@redux/store/configureStore';

const ProfileScreen = ({navigation}) => {
  const {userData, accessToken} = useSelector(state => state.auth);
  const {fcmToken} = useSelector(state => state.notification);
  const [logoutLoader, setLogoutLoader] = useState(false);

  const {setUserData, setAccessToken, setShopSelected} = authActions;
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  useEffect(() => {
    fetchData();
  }, []);
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
      console.log('data', data);

      if (response.ok) {
        store.dispatch(setUserData(data));
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
  const logOut = async () => {
    setLogoutLoader(true);
    try {
      await logout(userData); // server push-token cleanup + FCM delete + local reset
    } finally {
      setLogoutLoader(false);
    }
  };

  const ProfileSection = ({icon, title, value}) => (
    <View style={styles.sectionContainer}>
      <Icon name={icon} size={24} color="#632240" />
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionValue}>{value}</Text>
      </View>
    </View>
  );

  const DocumentSection = ({title, number, image}) => (
    <TouchableOpacity style={styles.documentContainer}>
      <View style={styles.documentHeader}>
        <Icon name="file-document" size={24} color="#632240" />
        <Text style={styles.documentTitle}>{title}</Text>
      </View>
      <Text style={styles.documentNumber}>{number}</Text>
      {!isEmpty(image) && (
        <View style={styles.imageContainer}>
          <Image
            source={{uri: image}}
            style={styles.documentImage}
            resizeMode="cover"
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View View style={{flex: 1, paddingTop: 38, backgroundColor: '#632240'}}>
      {isFocused && (
        <StatusBar backgroundColor="#632240" barStyle="light-content" />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userData?.first_name?.charAt(0) || ''}
              {userData?.last_name?.charAt(0) || ''}
            </Text>
          </View>
          <Text style={styles.userName}>
            {userData?.first_name || ''} {userData?.last_name || ''}
          </Text>
          <Text style={styles.userEmail}>{userData?.email || ''}</Text>
        </View>

        {/* Basic Info Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>
          <ProfileSection
            icon="phone"
            title="Phone"
            value={userData?.phone || ''}
          />
          <ProfileSection
            icon="email"
            title="Email"
            value={userData?.email || ''}
          />
          <ProfileSection
            icon="calendar"
            title="Joined"
            value={moment(userData?.created_at).format('MMMM DD, YYYY') || ''}
          />
        </View>

        {/* Bank Details Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bank Details</Text>
          <ProfileSection
            icon="bank"
            title="Account Number"
            value={userData?.bank_account_num || 'Unknown'}
          />
          <ProfileSection
            icon="bank-transfer"
            title="IFSC Code"
            value={userData?.ifsc_code || 'Unknown'}
          />
        </View>

        {/* Documents Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Documents</Text>
          <DocumentSection
            title="Aadhar Card"
            number={userData?.aadhar_num || 'Not Available'}
          />
          <DocumentSection
            title="PAN Card"
            number={userData?.pan_num || 'Not Available'}
          />
          <DocumentSection
            title="GST Certificate"
            number={userData?.gst_num || 'Not Available'}
          />
          <DocumentSection
            title="TAN Card"
            number={userData?.tan_num || 'Not Available'}
          />
        </View>
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              // Add your logout logic here
              logOut();
            }}>
            {logoutLoader ? (
              <ActivityIndicator color={'#fff'} style={{padding: 2}} />
            ) : (
              <>
                <Icon
                  name="logout"
                  size={24}
                  color="#fff"
                  style={styles.logoutIcon}
                />
                <Text style={styles.logoutText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
              <View style={styles.footer}>
          <View style={styles.footerRule} />
          <Text style={styles.footerVersion}>
            Version {DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
          </Text>
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL('https://aystera.com/')}
            style={[styles.footerLine, styles.footerLink]}>
            Built and managed by Aystera Software Solutions LLP
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#632240',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#632240',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#e5e7eb',
  },
  logoutContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
    paddingTop: 10,
  },
  logoutButton: {
    backgroundColor: '#632240',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionContent: {
    marginLeft: 15,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionValue: {
    fontSize: 16,
    color: '#1f2937',
    marginTop: 2,
  },
  documentContainer: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 10,
  },
  documentNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 34,
  },
  imageContainer: {
    marginTop: 10,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  footer: {alignItems: 'center', paddingTop: 22, paddingBottom: 12, paddingHorizontal: 24},
  footerRule: {width: 36, height: StyleSheet.hairlineWidth * 2, backgroundColor: '#D5D5DC', marginBottom: 12},
  footerVersion: {fontSize: 12, color: '#9A9AA5', fontWeight: '600'},
  footerLine: {fontSize: 11, color: '#B5B5BD', marginTop: 3, textAlign: 'center'},
  footerLink: {textDecorationLine: 'underline', textDecorationColor: '#D5D5DC'},
});

export default ProfileScreen;
