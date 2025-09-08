/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BarChart} from 'react-native-gifted-charts';

import {useSelector} from 'react-redux';
import * as Animatable from 'react-native-animatable';
import BaseSetting from '@config/setting';
import ShopSelector from '@components/SelectShop';
import authActions from '@redux/reducers/auth/actions';
import {store} from '@redux/store/configureStore';
import _, {isEmpty} from 'lodash';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
const DashboardScreen = ({navigation}) => {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const {setShopSelected} = authActions;

  const {userData, shopSelected} = useSelector(state => state.auth);
  console.log('userData', userData);
  console.log('shopSelected', shopSelected);
  const {accessToken} = useSelector(state => state.auth);
  console.log('accessToken', accessToken);

  const [shopList, setShopList] = useState([]);
  const [dashboardList, setDashboardList] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
      fetchData();
      fetchDashboardData();
    }, [shopSelected]),
  );
  useEffect(() => {
    if (isEmpty(shopSelected)) {
      setIsBottomSheetVisible(true);
    }
  }, []);

  const fetchData = async () => {
    const url = BaseSetting.baseUrl + BaseSetting.endpoints.getAllShops;
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
      console.log('dataxxxx', data);

      if (response.ok) {
        console.log('Response Data:', data);
        setShopList(data);
      } else {
        console.log('Error:');
      }

      console.log('Response Data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const fetchNotifications = async () => {
    console.log('fetchNotifications');

    // setLoading(true);
    const url = BaseSetting.baseUrl + BaseSetting.endpoints.notiList;
    const headers = {
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };

    try {
      const response = await fetch(url, {method: 'GET', headers});
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('data============', data);

      if (response.ok) {
        setNotifications(data?.data);
      } else {
        console.log('Error fetching notifications:', data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      // setLoading(false);
    }
  };
  const allMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const monthlyData = {
    labels: allMonths,
    datasets: [
      {
        data: allMonths.map(month => {
          const found = dashboardList?.graph?.find(entry =>
            entry.month?.startsWith(month),
          );
          return found ? parseFloat(found?.payment_amount) : 0;
        }),
      },
    ],
  };

  const barData = monthlyData.labels.map((month, index) => ({
    value: monthlyData.datasets[0].data[index],
    label: month,
    frontColor: '#632240',
  }));
  console.log('barData', barData);

  const minAmount = () => {
    const containerCharges =
      !_.isUndefined(dashboardList?.charges) &&
      _.isArray(dashboardList?.charges)
        ? _.first(dashboardList?.charges)
        : '';
    console.log('dashboardList?.charges---->', dashboardList?.charges);
    const progress =
      (containerCharges?.paid_amount / containerCharges?.total_amount) * 100;

    return {...containerCharges, progress};
  };

  const fetchDashboardData = async () => {
    const url =
      BaseSetting.baseUrl +
      `${BaseSetting.endpoints.dashboardList}/${shopSelected?.pr_id}`;
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
      console.log('data23456', data);

      if (response.ok) {
        console.log('Response Data:kljhgfdfghjk', data);
        setDashboardList(data);
      } else {
        console.log('Error:');
      }

      console.log('Response Data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const hasUnread = notifications.some(
    notification => notification.read === false,
  );
  const iconRef = useRef(null);

  useEffect(() => {
    console.log('hasUnread', hasUnread);
    if (hasUnread) {
      const interval = setInterval(() => {
        if (iconRef.current) {
          iconRef.current.swing(800);
        }
      }, 3500);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [hasUnread]);

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hi, {userData?.first_name + ' ' + userData?.last_name}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsBottomSheetVisible(true);
                fetchData();
              }}
              style={styles.shopSelector}>
              <Text style={styles.shopName}>
                {shopSelected?.property_name || 'Select a Shop'}
              </Text>
              <Icon name="chevron-down" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('NotificationScreen');
            }}
            style={styles.notificationButton}>
            <Animatable.View ref={iconRef}>
              <Icon name="bell-outline" size={24} color="#333" />
            </Animatable.View>
            {hasUnread && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>

        {/* Monthly Bill Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Bill Overview</Text>
          <Animatable.View
            duration={1000}
            animation={'slideInUp'}
            style={styles.chart}>
            <BarChart
              data={barData}
              yAxisTextStyle={{color: '#888'}}
              xAxisLabelTextStyle={{color: 'black'}}
              xAxisColor={'#888'}
              color={'#632240'}
              yAxisLabelSuffix=""
              yAxisLabelPrefix="₹ "
              noOfSections={5}
              barBorderRadius={5}
              spacing={5}
              hideYAxisText={false}
              // disablePress\
              onPress={data => {
                if (data?.value > 0) {
                  Toast.show({
                    text2:
                      data?.label +
                      ' : ₹' +
                      Number(data?.value)?.toLocaleString(),
                    type: 'info',
                  });
                }
              }}
              yAxisLabelWidth={60}
            />
          </Animatable.View>
        </View>

        {/* Outstanding Payments */}

        <View
          style={[
            styles.card,
            {
              marginBottom: Platform?.OS === 'ios' ? 80 : 40,
            },
          ]}>
          <Text style={styles.cardTitle}>Outstanding Payments</Text>
          {dashboardList?.outstandingBills?.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No Outstanding payments.</Text>
            </View>
          ) : (
            dashboardList?.outstandingBills?.map((payment, index) => (
              <View
                key={index}
                style={[
                  styles.paymentRow,
                  index === dashboardList?.outstandingBills.length - 1 &&
                    styles.lastPaymentRow,
                ]}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.amount}>
                    ₹{Number(payment?.payment_amount)?.toLocaleString()}
                  </Text>
                  <Text style={styles.month}>
                    {Number(payment?.payment_amount)?.toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Bills');
                  }}
                  style={styles.payButton}>
                  <Text style={styles.payButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={styles.warningContainer}>
            <Icon name="information" size={20} color="#666" />
            <Text style={styles.warningText}>
              Keep your shop running smoothly by clearing dues on time!
            </Text>
          </View>
        </View>

        {/* Container Charges */}
        {!isEmpty(dashboardList?.charges) && (
          <View
            style={[
              styles.card,
              {marginBottom: Platform.OS === 'ios' ? 100 : 25},
            ]}>
            <Text style={styles.cardTitle}>Container Charges</Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {width: `${minAmount()?.progress || 0}%`},
                ]}
              />
            </View>
            <View style={styles.chargesContainer}>
              <Text style={styles.chargeText}>₹{minAmount()?.paid_amount}</Text>
              <Text style={styles.chargeText}>
                ₹{minAmount()?.total_amount || 0}
              </Text>
            </View>
            <Text style={styles.remainingText}>
              <Text style={styles.highlightedAmount}>
                {minAmount()?.total_amount - minAmount()?.paid_amount === 0
                  ? 'Paid'
                  : '₹' +
                    Number(
                      minAmount()?.total_amount - minAmount()?.paid_amount,
                    )}
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>
      <ShopSelector
        shops={shopList}
        isVisible={isBottomSheetVisible}
        onSelect={t => {
          console.log('Selected Shop:', t);
          store.dispatch(setShopSelected(t));
          setTimeout(() => {
            setIsBottomSheetVisible(false);
          }, 200);
        }}
        onClose={() => setIsBottomSheetVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  shopSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  shopName: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#632240',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lastPaymentRow: {
    borderBottomWidth: 0,
  },
  paymentInfo: {
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  month: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  payButton: {
    backgroundColor: '#632240',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  warningText: {
    marginLeft: 10,
    color: '#666',
    flex: 1,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginVertical: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#632240',
    borderRadius: 4,
  },
  chargesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  chargeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  remainingText: {
    marginTop: 10,
    color: '#666',
  },
  highlightedAmount: {
    color: '#632240',
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DashboardScreen;
