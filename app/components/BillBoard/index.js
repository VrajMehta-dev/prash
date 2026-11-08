import React, {useEffect, useState, useCallback} from 'react';
import {tap} from '@utils/haptics';
import {TAB_BAR_SPACE} from '@navigation/BottomTab';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Linking,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'react-native-linear-gradient';
import {downloadPdf} from '@utils/downloadPdf';
import {usePaymentQueue} from '@utils/usePaymentQueue';
import BaseSetting from '@config/setting';
import {useSelector} from 'react-redux';
import CPageLoader from '@components/CPageLoader';
import {Images} from '@config/images';
import {BaseColors, ToastConfig} from '@config/theme';
import {isNull} from 'lodash';
import {useIsFocused} from '@react-navigation/native';
const {width} = Dimensions.get('window');
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import SettleBillsModal from '@components/PendingModal';
import moment from 'moment';

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

const BillCard = ({
  bill,
  onPayNow,
  blockedBy,
  onDownloadInvoice,
  onDownloadReceipt,
  isLast,
}) => {
  const {
    month,
    rent,
    variable_rent,
    cgst,
    sgst,
    igst,
    electricity_bill,
    penalty,
    tds_percent,
    extra_charges,
    payment_amount,
    status,
    due_date,
    sgst_percent,
    cgst_percent,
    igst_percent,
    tds,
    bill_id,
    default_charges,
    other_charges,
  } = bill;

  const isPaid = status === 'paid';
  console.log('isPaid', isPaid);
  const statusNow = status;
  console.log('🚀 ~ file: index.js:113 ~ statusNow:', statusNow);
  const dueDateObj = new Date(due_date);
  const today = new Date();

  // Remove time part to avoid partial-day differences
  dueDateObj.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = dueDateObj - today; // milliseconds
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // Handle new data structure with default_charges array
  const getChargeAmount = title => {
    if (default_charges && Array.isArray(default_charges)) {
      const charge = default_charges.find(c => c.title === title);
      return charge ? charge.amount : 0;
    }
    return 0;
  };

  // Fallback to old structure if default_charges not available
  const rentAmount = getChargeAmount('Rent') || rent || 0;
  const maintenanceAmount =
    getChargeAmount('Maintenance and other reimbursement') || 0;
  const commissionAmount = getChargeAmount('Commission') || 0;
  const penaltyAmount = getChargeAmount('Overdue Penalty') || penalty || 0;

  const totalGST = cgst + sgst + igst;
  // Calculate GST percentage based on available data
  const gstPercentage =
    cgst_percent && sgst_percent && igst_percent
      ? Number(
          parseFloat(cgst_percent) +
            parseFloat(sgst_percent) +
            parseFloat(igst_percent),
        )
      : totalGST > 0
      ? Math.round(
          (totalGST / (parseFloat(payment_amount || 0) - totalGST)) * 100,
        )
      : 0;
  const [loader, setLoader] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Rounded amount display - only show if greater than 0
  const roundedAmount = bill?.rounded_amount || 0;
  return (
    <Animated.View
      style={[
        styles.cardContainer,
        isLast && {marginBottom: 100}, // Add extra bottom margin for last item
      ]}>
      <LinearGradient
        colors={isPaid ? ['#ffffff', '#f8f9fa'] : ['#ffffff', '#fff5f5']}
        style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.month}>{moment(month).format('MMM YYYY')}</Text>
            <Text style={styles.statusText}>
              {isPaid
                ? 'Payment completed'
                : due_date
                ? (() => {
                    const dueDateObj = new Date(due_date);
                    if (isNaN(dueDateObj)) return 'Invalid due date';

                    const today = new Date();
                    dueDateObj.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    const diffTime = dueDateObj - today;
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24),
                    );

                    return `Due on: ${dueDateObj.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })} (${
                      diffDays > 0
                        ? `${diffDays} days left`
                        : diffDays === 0
                        ? 'Due today'
                        : `${Math.abs(diffDays)} days overdue`
                    })`;
                  })()
                : 'No due date available'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              statusNow === 'overdue'
                ? styles.overdueBadge
                : isPaid
                ? styles.paidBadge
                : styles.pendingBadge,
              {position: 'absolute', right: 2},
            ]}>
            <Icon
              name={isPaid ? 'check-circle' : 'clock'}
              size={16}
              color={
                statusNow === 'overdue'
                  ? BaseColors.white
                  : isPaid
                  ? '#4caf50'
                  : '#ff9800'
              }
            />
            <Text
              style={[
                styles.statusBadgeText,
                statusNow === 'overdue'
                  ? styles.overdueText
                  : isPaid
                  ? styles.paidText
                  : styles.pendingText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              minimumFontScale={0.85}>
              {statusNow === 'overdue'
                ? 'OVERDUE'
                : isPaid
                ? 'PAID'
                : statusNow === 'pending'
                ? 'PENDING'
                : 'IN REVIEW'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            tap();
            setExpanded(e => !e);
          }}
          style={styles.amountRow}>
          <View>
            <Text style={styles.amountLabel}>
              {isPaid ? 'Amount paid' : 'Amount due'}
            </Text>
            <Text style={styles.amountValue}>
              {'\u20B9'}
              {Number(payment_amount || 0).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.detailsToggle}>
            <Text style={styles.detailsToggleText}>
              {expanded ? 'Hide' : 'Breakdown'}
            </Text>
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#632240"
            />
          </View>
        </TouchableOpacity>
        {expanded && (
        <View style={styles.billDetails}>
          <View style={styles.row}>
            <Text style={styles.label}>Rent</Text>
            <Text style={styles.value}>₹{rentAmount?.toLocaleString()}</Text>
          </View>

          {maintenanceAmount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Maintenance</Text>
              <Text style={styles.value}>
                ₹{maintenanceAmount?.toLocaleString()}
              </Text>
            </View>
          )}

          {commissionAmount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Commission</Text>
              <Text style={styles.value}>
                ₹{commissionAmount?.toLocaleString()}
              </Text>
            </View>
          )}

          {penaltyAmount > 0 && (
            <View style={styles.row}>
              <View style={styles.labelWithIcon}>
                <Icon name="alert-circle" size={16} color="#ff9800" />
                <Text style={[styles.label, styles.penaltyLabel]}>Penalty</Text>
              </View>
              <Text style={[styles.value, styles.penaltyValue]}>
                ₹{penaltyAmount?.toLocaleString()}
              </Text>
            </View>
          )}

          {/* Show other charges if available */}
          {other_charges &&
            Array.isArray(other_charges) &&
            other_charges.length > 0 &&
            other_charges.map((charge, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>
                  {charge.title || 'Other Charge'}
                </Text>
                <Text style={styles.value}>
                  ₹{charge.amount?.toLocaleString()}
                </Text>
              </View>
            ))}
          <View style={styles.row}>
            <Text style={styles.label}>
              GST {gstPercentage > 0 ? `(${gstPercentage}%)` : ''}
            </Text>
            <Text style={styles.value}>₹{totalGST?.toLocaleString()}</Text>
          </View>

          {tds > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>
                TDS ({tds_percent ? `${tds_percent}%` : 'N/A'})
              </Text>
              <Text style={styles.value}>₹{tds?.toLocaleString()}</Text>
            </View>
          )}

          {/* Rounded Amount - only show if greater than 0 */}
          {roundedAmount > 0 && (
            <View style={styles.row}>
              <View style={styles.labelWithIcon}>
                <Text style={[styles.label, styles.roundedLabel]}>
                  Rounded Amount
                </Text>
              </View>
              <Text style={[styles.value, styles.roundedValue]}>
                ₹{roundedAmount?.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
        )}
        {!isPaid && !!blockedBy && (
          <Text style={{color: '#9A5B00', fontSize: 12, fontWeight: '600', marginBottom: 8}}>
            {`Pay "${blockedBy}" first`}
          </Text>
        )}
        <View style={styles.actionsRow}>
          {statusNow !== 'in_review' ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'stretch',
                flex: 1,
                gap: 10,
              }}>
              <TouchableOpacity
                onPress={() => {
                  if (!isPaid && blockedBy) {
                    return;
                  }
                  tap();
                  if (!isPaid) {
                    onPayNow(bill_id);
                  } else {
                    onDownloadReceipt(bill_id);
                  }
                }}
                style={[
                  styles.button,
                  {flex: 1.5},
                  isPaid ? styles.downloadButton : styles.payButton,
                  !isPaid && !!blockedBy && {backgroundColor: '#ECECF1'},
                ]}
                activeOpacity={blockedBy && !isPaid ? 1 : 0.8}>
                <Icon
                  name={isPaid ? 'download' : blockedBy ? 'lock-outline' : 'credit-card'}
                  size={20}
                  color={!isPaid && blockedBy ? '#8A8A95' : '#fff'}
                />
                <Text style={[styles.buttonText, !isPaid && !!blockedBy && {color: '#8A8A95'}]}>
                  {isPaid ? 'Receipt' : blockedBy ? 'Locked' : 'Pay now'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={loader}
                onPress={() => {
                  tap();
                  onDownloadInvoice(bill_id);
                  setLoader(true);
                  setTimeout(() => {
                    setLoader(false);
                  }, 5000);
                }}
                style={[
                  styles.button,
                  {borderColor: '#632240', borderWidth: 1},
                ]}
                activeOpacity={0.8}>
                {loader ? (
                  <ActivityIndicator size="small" color="#632240" />
                ) : (
                  <>
                    <Icon name={'download'} size={20} color="#632240" />
                    <Text style={{color: '#632240', marginLeft: 6}}>
                      Invoice
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.reviewNotice}>
                <Icon name="information" size={18} color="#8a6d3b" />
                <Text style={styles.reviewText}>
                  Your bill is under review. You won’t be able to make a payment
                  until the review is completed, but don’t worry — penalties are
                  frozen until then.
                </Text>
              </View>

              <TouchableOpacity
                disabled={loader}
                onPress={() => {
                  tap();
                  onDownloadInvoice(bill_id);
                  setLoader(true);
                  setTimeout(() => {
                    setLoader(false);
                  }, 5000);
                }}
                style={[
                  styles.button,
                  {borderColor: '#632240', borderWidth: 1},
                ]}
                activeOpacity={0.8}>
                {loader ? (
                  <ActivityIndicator size="small" color="#632240" />
                ) : (
                  <>
                    <Icon name={'download'} size={20} color="#632240" />
                    <Text style={{color: '#632240', marginLeft: 6}}>
                      Download Invoice
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const BillsDashboard = ({navigation}) => {
  const queue = usePaymentQueue();
  const [activeTab, setActiveTab] = useState('pending');
  const [billsList, setBillsList] = useState([]);
  const [paymentLink, setPaymentLink] = useState(null);
  const [accessKey, setAccessKey] = useState(null);
  const [invoiceLink, setinvoiceLink] = useState(null);
  const {accessToken} = useSelector(state => state.auth);
  const {shopSelected} = useSelector(state => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [isAdditionalChargePending, setIsAdditionalChargePending] =
    useState(false);
  const [isPreviousBillPending, setIsPreviousBillPending] = useState(false);

  const isFocused = useIsFocused();
  useEffect(() => {
    fetchData();
    checkAdditionalCharges();
  }, [fetchData, checkAdditionalCharges, isFocused]);

  useEffect(() => {
    if (!isNull(accessKey || paymentLink)) {
      navigation.navigate('Settings', {
        link: paymentLink,
        accessKey: accessKey,
      });
    }
  }, [accessKey, navigation]);

  // Manage modal visibility based on pending states

  const checkAdditionalCharges = useCallback(async () => {
    if (!shopSelected?.pr_id) return;

    const url =
      BaseSetting.baseUrl +
      BaseSetting.endpoints.getAdditionalCharges +
      shopSelected.pr_id;
    const headers = {
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok && data && data.data) {
        // Check if there are any pending additional charges
        const hasPendingCharges = data.data.some(
          charge => charge.status === 'pending' || charge.status === 'overdue',
        );
        setIsAdditionalChargePending(hasPendingCharges);
      } else {
        setIsAdditionalChargePending(false);
      }
    } catch (error) {
      console.error('Error checking additional charges:', error);
      setIsAdditionalChargePending(false);
    }
  }, [shopSelected?.pr_id, accessToken]);

  const fetchData = useCallback(async () => {
    const url =
      BaseSetting.baseUrl +
      BaseSetting.endpoints.getBills +
      '/' +
      shopSelected?.pr_id;

    console.log('url', url);
    const headers = {
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        // Handle new nested response structure
        if (data && data.bills) {
          // Combine paid and unpaid bills into a single array
          const allBills = [
            ...(data.bills.paid || []),
            ...(data.bills.unpaid || []),
          ];

          setBillsList(allBills);

          // Reset pending states based on actual data
          setIsPreviousBillPending(false);
          setIsAdditionalChargePending(false);
        } else {
          // Fallback for old structure or empty response
          console.log('Using fallback structure');
          setBillsList([]);
          setIsPreviousBillPending(false);
          setIsAdditionalChargePending(false);
        }
      } else {
        console.log('Error fetching bills');
        setBillsList([]);
        setIsPreviousBillPending(false);
        setIsAdditionalChargePending(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsPreviousBillPending(false);
      setIsAdditionalChargePending(false);
    }
  }, [shopSelected?.pr_id, accessToken]);
  const fetchPaymentLink = async id => {
    const url = BaseSetting.baseUrl + BaseSetting.endpoints.getPaymentLink + id;

    console.log('url', url);
    const headers = {
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        setPaymentLink(data?.payment_link || null);
        setAccessKey(data?.access_key || null);
      } else {
        console.log('Error fetching bills');
        setPaymentLink(null);
        setAccessKey(data?.access_key || null);
        if (data?.code === 'SECURITY_DEPOSIT_UNPAID') {
          navigation.navigate('SecurityDeposit');
        }
        if (data?.is_prev_bill_pending) {
          setIsPreviousBillPending(true);
          setShowModal(true);
        }
        if (data?.is_additional_charge_pending) {
          setIsAdditionalChargePending(true);
          setShowModal(true);
        }

        // Show modal if either state is true
        if (data?.is_prev_bill_pending || data?.is_additional_charge_pending) {
          setShowModal(true);
        }
        Toast.show({
          text1: 'Opps!',
          text2: data?.msg || 'Something went wrong',
          type: 'error',
        });
        // setBillsList([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchInvoiceLink = id =>
    downloadPdf(`${BaseSetting.endpoints.invoiceDownload}/${id}`, `invoice-${id}.pdf`);
  const receiptDownload = id =>
    downloadPdf(`${BaseSetting.endpoints.receiptDownload}/${id}`, `receipt-${id}.pdf`);

  const filteredBills = billsList.filter(bill =>
    activeTab === 'pending'
      ? bill.status === 'pending' ||
        bill.status === 'overdue' ||
        bill.status === 'in_review'
      : bill.status === 'paid',
  );
  // Pending list reads in the order the dues must be paid: oldest first.
  if (activeTab === 'pending') {
    filteredBills.sort((a, b) => a.bill_id - b.bill_id);
  }

  return (
    <>
      {isFocused && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#fff"
          showHideTransition="slide"
        />
      )}
      <ScrollView
        contentContainerStyle={{paddingBottom: TAB_BAR_SPACE}}
        style={[
          styles.container,
          {backgroundColor: !filteredBills.length === 0 ? '#f8f9fa' : 'white'},
        ]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Monthly Rent</Text>
          <Text style={styles.headerSubtitle}>
            Track and manage your payments for (
            {shopSelected?.property_name ||
              'Select the Property from Dashboard'}
            )
          </Text>
        </View>

        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

        <Animatable.View
          animation={'slideInUp'}
          style={[
            styles.billsList,
            {
              marginBottom:
                filteredBills.length >= 3
                  ? Dimensions.get('screen').height / 15
                  : filteredBills.length - 1,
            },
          ]}>
          {filteredBills.length === 0 ? (
            <CPageLoader
              showTitle
              style={{height: Dimensions.get('window').height / 2.6}}
              lisEmptyComponent
            />
          ) : (
            filteredBills.map((bill, index) => (
              <BillCard
                key={`bill-${bill.bill_id}`}
                bill={bill}
                blockedBy={queue.blockedOf('bill', bill.bill_id)}
                isLast={index === filteredBills.length - 1}
                onPayNow={id => {
                  fetchPaymentLink(id);
                }}
                onDownloadInvoice={id => {
                  fetchInvoiceLink(id);
                }}
                onDownloadReceipt={id => {
                  receiptDownload(id);
                }}
              />
            ))
          )}
        </Animatable.View>
        <SettleBillsModal
          visible={showModal}
          onClose={() => {
            setShowModal(false);
            // Reset states when modal is closed
            setIsPreviousBillPending(false);
            setIsAdditionalChargePending(false);
          }}
          onSettleBills={() => {
            if (isAdditionalChargePending) {
              navigation.navigate('Charges', {
                additional_charge_id: 'pending',
              });
            } else {
              navigation.navigate('Bills');
            }
          }}
          isPreviousBillPending={isPreviousBillPending}
          isAdditionalChargePending={isAdditionalChargePending}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  reviewNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewText: {
    color: '#8a6d3b',
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
    fontSize: 12,
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
  billsList: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 12,
    borderRadius: 16,
    // overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  month: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
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
  billDetails: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#6c757d',
    fontSize: 14,
    marginLeft: 8,
  },
  penaltyLabel: {
    color: '#ff9800',
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
  penaltyValue: {
    color: '#ff9800',
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 0,
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
    fontSize: 15,
    marginLeft: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f3f5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  amountLabel: {fontSize: 12, color: '#6c757d', fontWeight: '600'},
  amountValue: {fontSize: 24, fontWeight: '700', color: '#2d3436', marginTop: 2},
  detailsToggle: {flexDirection: 'row', alignItems: 'center', gap: 2},
  detailsToggleText: {fontSize: 13, color: '#632240', fontWeight: '600'},
});

export {TabSelector};
export default BillsDashboard;
