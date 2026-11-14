import React, {useEffect, useState, useCallback, useRef} from 'react';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'react-native-linear-gradient';
import {BaseColors} from '@config/theme';
import {useSelector} from 'react-redux';
import CPageLoader from '@components/CPageLoader';
import {downloadPdf} from '@utils/downloadPdf';
import ScreenHeader from '@components/ScreenHeader';
import {usePaymentQueue} from '@utils/usePaymentQueue';
import BaseSetting from '@config/setting';
import * as Animatable from 'react-native-animatable';
import {BillCard} from '@components/BillBoard';
import {isNull} from 'lodash';
import {useIsFocused} from '@react-navigation/native';
import {startCheckout} from '@utils/checkout';
import {onPaymentChange} from '@utils/paymentEvents';

const {width} = Dimensions.get('window');

const TabSelector = ({activeTab, onTabChange}) => (
  <View style={styles.tabContainer}>
    <View style={styles.tabWrapper}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'pending' && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange('pending')}>
        <Icon
          name={activeTab === 'pending' ? 'clock' : 'clock-outline'}
          size={20}
          color={activeTab === 'pending' ? '#632240' : '#9e9e9e'}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'pending' && styles.tabTextActive,
          ]}>
          Pending
        </Text>
        {activeTab === 'pending' && <View style={styles.activeTabLine} />}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'paid' && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange('paid')}>
        <Icon
          name={activeTab === 'paid' ? 'check-circle' : 'check-circle-outline'}
          size={20}
          color={activeTab === 'paid' ? '#632240' : '#9e9e9e'}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'paid' && styles.tabTextActive,
          ]}>
          Paid
        </Text>
        {activeTab === 'paid' && <View style={styles.activeTabLine} />}
      </TouchableOpacity>
    </View>
  </View>
);

const money = n => `₹${parseFloat(n || 0).toLocaleString('en-IN')}`;
const chargeRows = c => {
  const gst = parseFloat(c.cgst_amount || 0) + parseFloat(c.sgst_amount || 0) + parseFloat(c.igst_amount || 0);
  const gstPct = parseFloat(c.cgst_percent || 0) + parseFloat(c.sgst_percent || 0) + parseFloat(c.igst_percent || 0);
  return [
    {label: 'Amount', value: money(c.amount)},
    {label: `GST${gstPct > 0 ? ` (${gstPct}%)` : ''}`, value: money(gst)},
    ...(parseFloat(c.tds_amount || 0) > 0
      ? [{label: `TDS (${c.tds_percent ? `${c.tds_percent}%` : 'N/A'})`, value: money(c.tds_amount)}]
      : []),
    ...(parseFloat(c.rounded_amount || 0) > 0 ? [{label: 'Rounded Amount', value: money(c.rounded_amount), kind: 'rounded'}] : []),
  ];
};

const AdditionalCharges = ({navigation, route}) => {
  const queue = usePaymentQueue();
  const [activeTab, setActiveTab] = useState('pending');
  const [chargesList, setChargesList] = useState([]);
  const [animatePaymentButton, setAnimatePaymentButton] = useState(false);
  const {accessToken} = useSelector(state => state.auth);
  const {shopSelected} = useSelector(state => state.auth);
  const isFocused = useIsFocused();

  const fetchAdditionalCharges = useCallback(async () => {
    const url =
      BaseSetting.baseUrl +
      BaseSetting.endpoints.getAdditionalCharges +
      shopSelected?.pr_id;

    console.log('url', url);
    const headers = {
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };
    console.log('headers', headers);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      console.log('response', response);

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        if (data && data.data) {
          setChargesList(data.data);
        } else {
          setChargesList([]);
        }
      } else {
        console.log('Error fetching additional charges');
        setChargesList([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setChargesList([]);
    }
  }, [accessToken, shopSelected?.pr_id]);

  useEffect(() => {
    fetchAdditionalCharges();
  }, [isFocused, fetchAdditionalCharges]);
  useEffect(() => onPaymentChange(fetchAdditionalCharges), [fetchAdditionalCharges]);

  // Check for pending charge animation on component mount
  useEffect(() => {
    if (route.params?.additional_charge_id) {
      setAnimatePaymentButton(true);
      // Auto-scroll to pending tab if there's a pending charge
      setActiveTab('pending');

      // Stop animation after 3 seconds
      setTimeout(() => {
        setAnimatePaymentButton(false);
      }, 3000);
    }
  }, [route.params?.additional_charge_id]);


  const filteredCharges = chargesList.filter(charge =>
    activeTab === 'pending'
      ? charge.status === 'pending' || charge.status === 'overdue'
      : charge.status === 'paid',
  );
  if (activeTab === 'pending') {
    filteredCharges.sort((a, b) => a.additional_charge_id - b.additional_charge_id);
  }


  const fetchPaymentLink = id => {
    const c = chargesList.find(x => x.additional_charge_id === id);
    startCheckout({kind: 'additional_charge', id, title: c?.title || 'Extra charge', subtitle: 'Extra charge', amount: c?.payment_amount});
  };

  const fetchInvoiceLink = id =>
    downloadPdf(`${BaseSetting.endpoints.invoiceADownload}${id}`, `invoice-${id}.pdf`);

  const receiptDownload = id =>
    downloadPdf(`${BaseSetting.endpoints.receiptADownload}${id}`, `receipt-${id}.pdf`);

  return (
    <>
    <ScrollView
      contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}
      style={[
        styles.container,
        {backgroundColor: !filteredCharges.length === 0 ? '#f8f9fa' : 'white'},
      ]}>
      <ScreenHeader title="Extra Charges" subtitle={shopSelected?.property_name} />

      <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

      <Animatable.View
        animation={'slideInUp'}
        style={[
          styles.chargesList,
          {
            marginBottom:
              filteredCharges.length >= 3
                ? Dimensions.get('screen').height / 15
                : filteredCharges.length - 1,
          },
        ]}>
        {filteredCharges.length === 0 ? (
          <CPageLoader
            showTitle
            title={'No charges available'}
            style={{height: Dimensions.get('window').height / 2.6}}
            lisEmptyComponent
          />
        ) : (
          filteredCharges.map((charge, index) => {
            const shouldAnimate =
              animatePaymentButton &&
              (route.params?.additional_charge_id ===
                charge.additional_charge_id ||
                route.params?.additional_charge_id === 'pending');

            if (shouldAnimate) {
              console.log(
                'Animating charge:',
                charge.additional_charge_id,
                'Route param:',
                route.params?.additional_charge_id,
              );
            }

            return (
              <BillCard
                key={`charge-${charge.additional_charge_id}`}
                bill={{
                  bill_id: charge.additional_charge_id,
                  status: charge.status,
                  payment_amount: charge.payment_amount,
                  rounded_amount: charge.rounded_amount,
                }}
                title={charge.title}
                subtitle={charge.status === 'paid' ? 'Payment completed' : charge.description || 'Extra charge'}
                rows={chargeRows(charge)}
                blockedBy={queue.blockedOf('additional_charge', charge.additional_charge_id)}
                isLast={index === filteredCharges.length - 1}
                onDownloadInvoice={fetchInvoiceLink}
                onDownloadReceipt={receiptDownload}
                onPayNow={fetchPaymentLink}
              />
            );
          })
        )}
      </Animatable.View>

    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overdueText: {
    color: 'white',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  tabContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.7,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#9e9e9e',
  },
  tabTextActive: {
    color: '#632240',
    fontWeight: '600',
  },
  activeTabLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#632240',
  },
  chargesList: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6c757d',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#fff3e0',
  },
  paidBadge: {
    backgroundColor: '#e8f5e9',
  },
  overdueBadge: {backgroundColor: '#FF5555'},
  statusBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  pendingText: {
    color: '#ff9800',
  },
  paidText: {
    color: '#4caf50',
  },
  chargeDetails: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: '#6c757d',
    fontSize: 14,
  },
  roundedLabel: {
    color: '#632240',
    fontWeight: '600',
  },
  value: {
    fontWeight: '500',
    color: '#2d3436',
    fontSize: 15,
  },
  roundedValue: {
    color: '#632240',
    fontWeight: '600',
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  payButton: {
    backgroundColor: '#632240',
  },
  downloadButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#632240',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  detailsContent: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#632240',
  },
  descriptionText: {
    fontSize: 14,
    color: '#2d3436',
    lineHeight: 20,
    textAlign: 'justify',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#632240',
  },
  animatedButton: {
    // Simple pulse animation - no extra styling needed
  },
});

export default AdditionalCharges;
