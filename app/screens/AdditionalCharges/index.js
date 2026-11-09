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
import RBSheet from 'react-native-raw-bottom-sheet';
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

const ChargeCard = ({
  charge,
  isLast,
  onViewDetails,
  onDownloadInvoice,
  onDownloadReceipt,
  onPayNow,
  blockedBy,
  shouldAnimate,
}) => {
  const {
    additional_charge_id,
    title,
    description,
    amount,
    cgst_amount,
    sgst_amount,
    igst_amount,
    tds_amount,
    payment_amount,
    total_amount,
    status,
    cgst_percent,
    sgst_percent,
    igst_percent,
    tds_percent,
    rounded_amount,
  } = charge;

  const isPaid = status === 'paid';
  const statusNow = status;
  const [loader, setLoader] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulse animation when shouldAnimate is true
  useEffect(() => {
    if (shouldAnimate && !isPaid) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      // Stop animation after 3 seconds
      setTimeout(() => {
        pulseAnimation.stop();
        pulseAnim.setValue(1);
      }, 3000);
    }
  }, [shouldAnimate, isPaid, pulseAnim]);

  const totalGST =
    parseFloat(cgst_amount || 0) +
    parseFloat(sgst_amount || 0) +
    parseFloat(igst_amount || 0);
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

  return (
    <Animated.View
      style={[styles.cardContainer, isLast && {marginBottom: 100}]}>
      <LinearGradient
        colors={isPaid ? ['#ffffff', '#f8f9fa'] : ['#ffffff', '#fff5f5']}
        style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={() => onViewDetails(charge)}
              style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Icon name="chevron-right" size={16} color="#632240" />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.statusBadge,
              statusNow === 'overdue'
                ? styles.overdueBadge
                : isPaid
                ? styles.paidBadge
                : styles.pendingBadge,
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
              ]}>
              {statusNow === 'overdue'
                ? 'OVERDUE'
                : isPaid
                ? 'PAID'
                : 'PENDING'}
            </Text>
          </View>
        </View>

        <View style={styles.chargeDetails}>
          <View style={styles.row}>
            <Text style={styles.label}>Base Amount</Text>
            <Text style={styles.value}>
              ₹{parseFloat(amount || 0).toLocaleString()}
            </Text>
          </View>

          {totalGST > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>
                GST {gstPercentage > 0 ? `(${gstPercentage}%)` : ''}
              </Text>
              <Text style={styles.value}>₹{totalGST.toLocaleString()}</Text>
            </View>
          )}

          {parseFloat(tds_amount || 0) > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>
                TDS ({tds_percent ? `${tds_percent}%` : 'N/A'})
              </Text>
              <Text style={styles.value}>
                ₹{parseFloat(tds_amount || 0).toLocaleString()}
              </Text>
            </View>
          )}

          {/* Rounded Amount - only show if greater than 0 */}
          {parseFloat(rounded_amount || 0) > 0 && (
            <View style={styles.row}>
              <View style={styles.labelWithIcon}>
                <Text style={[styles.label, styles.roundedLabel]}>
                  Rounded Amount
                </Text>
              </View>
              <Text style={[styles.value, styles.roundedValue]}>
                ₹{parseFloat(rounded_amount || 0).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ₹{parseFloat(payment_amount || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {!isPaid && !!blockedBy && (
          <Text style={{color: '#9A5B00', fontSize: 12, fontWeight: '600', marginBottom: 8}}>
            {`Pay "${blockedBy}" first`}
          </Text>
        )}
        <Animated.View
          style={[
            shouldAnimate &&
              !isPaid && {
                transform: [{scale: pulseAnim}],
              },
          ]}>
          <TouchableOpacity
            onPress={() => {
              if (!isPaid && blockedBy) {
                return;
              }
              if (!isPaid) {
                onPayNow(additional_charge_id);
              } else {
                onDownloadReceipt(additional_charge_id);
              }
            }}
            style={[
              styles.button,
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
              {isPaid ? 'Download Receipt' : blockedBy ? 'Locked' : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity
          disabled={loader}
          onPress={() => {
            onDownloadInvoice(additional_charge_id);
            setLoader(true);
            setTimeout(() => {
              setLoader(false);
            }, 5000);
          }}
          style={[styles.button, {borderColor: '#632240', borderWidth: 1}]}
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
      </LinearGradient>
    </Animated.View>
  );
};

const AdditionalCharges = ({navigation, route}) => {
  const queue = usePaymentQueue();
  const [activeTab, setActiveTab] = useState('pending');
  const [chargesList, setChargesList] = useState([]);
  const [selectedCharge, setSelectedCharge] = useState(null);
  console.log("🚀 ~ AdditionalCharges ~ selectedCharge:", selectedCharge)
  const [animatePaymentButton, setAnimatePaymentButton] = useState(false);
  const {accessToken} = useSelector(state => state.auth);
  const {shopSelected} = useSelector(state => state.auth);
  const rbSheetRef = useRef();
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

  const handleViewDetails = charge => {
    setSelectedCharge(charge);
    rbSheetRef.current?.open();
  };

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
              <ChargeCard
                key={`charge-${charge.additional_charge_id}`}
                charge={charge}
                blockedBy={queue.blockedOf('additional_charge', charge.additional_charge_id)}
                isLast={index === filteredCharges.length - 1}
                onViewDetails={handleViewDetails}
                onDownloadInvoice={fetchInvoiceLink}
                onDownloadReceipt={receiptDownload}
                onPayNow={fetchPaymentLink}
                shouldAnimate={shouldAnimate}
              />
            );
          })
        )}
      </Animatable.View>

      {/* RBSheet for Charge Details */}
      <RBSheet
        ref={rbSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          draggableIcon: {
            backgroundColor: '#000',
          },
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
          },
        }}
        height={Dimensions.get('window').height * 0.7}>
        {selectedCharge && (
          <ScrollView style={styles.detailsContainer}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>{selectedCharge.title}</Text>
              <TouchableOpacity
                onPress={() => rbSheetRef.current?.close()}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContent}>
              <View style={styles.descriptionContainer}>
                <Text style={styles.detailLabel}>Description</Text>
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>
                    {selectedCharge.description}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    selectedCharge.status === 'overdue'
                      ? styles.overdueBadge
                      : selectedCharge.status === 'paid'
                      ? styles.paidBadge
                      : styles.pendingBadge,
                  ]}>
                  <Icon
                    name={
                      selectedCharge.status === 'paid'
                        ? 'check-circle'
                        : 'clock'
                    }
                    size={16}
                    color={
                      selectedCharge.status === 'overdue'
                        ? BaseColors.white
                        : selectedCharge.status === 'paid'
                        ? '#4caf50'
                        : '#ff9800'
                    }
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      selectedCharge.status === 'overdue'
                        ? styles.overdueText
                        : selectedCharge.status === 'paid'
                        ? styles.paidText
                        : styles.pendingText,
                    ]}>
                    {selectedCharge.status === 'overdue'
                      ? 'OVERDUE'
                      : selectedCharge.status === 'paid'
                      ? 'PAID'
                      : 'PENDING'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Base Amount</Text>
                <Text style={styles.detailValue}>
                  ₹{parseFloat(selectedCharge.amount || 0).toLocaleString()}
                </Text>
              </View>

              {parseFloat(selectedCharge.cgst_amount || 0) > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    CGST ({selectedCharge.cgst_percent}%)
                  </Text>
                  <Text style={styles.detailValue}>
                    ₹
                    {parseFloat(
                      selectedCharge.cgst_amount || 0,
                    ).toLocaleString()}
                  </Text>
                </View>
              )}

              {parseFloat(selectedCharge.sgst_amount || 0) > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    SGST ({selectedCharge.sgst_percent}%)
                  </Text>
                  <Text style={styles.detailValue}>
                    ₹
                    {parseFloat(
                      selectedCharge.sgst_amount || 0,
                    ).toLocaleString()}
                  </Text>
                </View>
              )}

              {parseFloat(selectedCharge.igst_amount || 0) > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    IGST ({selectedCharge.igst_percent}%)
                  </Text>
                  <Text style={styles.detailValue}>
                    ₹
                    {parseFloat(
                      selectedCharge.igst_amount || 0,
                    ).toLocaleString()}
                  </Text>
                </View>
              )}

              {parseFloat(selectedCharge.tds_amount || 0) > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    TDS ({selectedCharge.tds_percent}%)
                  </Text>
                  <Text style={styles.detailValue}>
                    ₹
                    {parseFloat(
                      selectedCharge.tds_amount || 0,
                    ).toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Rounded Amount - only show if greater than 0 */}
              {parseFloat(selectedCharge.rounded_amount || 0) > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rounded Amount</Text>
                  <Text style={[styles.detailValue, styles.roundedValue]}>
                    ₹
                    {parseFloat(
                      selectedCharge.rounded_amount || 0,
                    ).toLocaleString()}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={[styles.detailValue, styles.totalAmount]}>
                  ₹
                  {parseFloat(
                    selectedCharge.payment_amount || 0,
                  ).toLocaleString()}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </RBSheet>
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
