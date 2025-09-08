import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';

const {width, height} = Dimensions.get('window');

const SettleBillsModal = ({
  visible,
  onClose,
  onSettleBills,
  isPreviousBillPending = true,
  customTitle,
  customMessage,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getTitle = () => {
    if (customTitle) return customTitle;
    return isPreviousBillPending ? 'Settle Previous Bills' : 'Settle Charges';
  };

  const getMessage = () => {
    if (customMessage) return customMessage;
    return isPreviousBillPending
      ? 'Please settle your previous bills before proceeding with new bills.'
      : 'Please settle your additional charges before proceeding with new bills.';
  };

  const handleSettleBills = async () => {
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onSettleBills && onSettleBills();
      onClose();
    }, 1500);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Background overlay that covers the entire screen including status bar */}
        <View style={styles.backgroundOverlay} />
        
        {/* BlurView for iOS, solid background for Android */}
        {Platform.OS === 'ios' ? (
          <BlurView
            style={styles.blurContainer}
            blurType="dark"
            blurAmount={15}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.85)"
          />
        ) : (
          <View style={styles.androidBlurContainer} />
        )}

        <View style={styles.modalContainer}>
          {/* Top accent bar */}
          <View style={[styles.accentBar, {backgroundColor: '#632240'}]} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{getTitle()}</Text>
            <Text style={styles.headerSubtitle}>{getMessage()}</Text>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.messageCard}>
              <Text style={styles.messageText}>
                {isPreviousBillPending
                  ? 'You have outstanding bills that need to be cleared before you can pay new bills. Please settle them to continue.'
                  : 'You have Additional Charges that need to be cleared first before you can pay new bills. Please settle them to continue.'}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isProcessing}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settleButton,
                {
                  backgroundColor: '#632240',
                },
                isProcessing && styles.settleButtonDisabled,
              ]}
              onPress={handleSettleBills}
              disabled={isProcessing}>
              {isProcessing && (
                <View style={styles.loadingSpinner}>
                  <View style={styles.spinner} />
                </View>
              )}
              <Text
                style={[
                  styles.settleButtonText,
                  isProcessing && styles.processingText,
                ]}>
                {isProcessing
                  ? 'Processing...'
                  : isPreviousBillPending
                  ? 'Settle Bills'
                  : 'Settle Charges'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  androidBlurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContainer: {
    width: width * 0.92,
    maxHeight: height * 0.85,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#FAFBFC',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  iconInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1D29',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  messageCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#632240',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  messageIcon: {
    fontSize: 20,
  },
  messageText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#632240',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 16,
    gap: 16,
    backgroundColor: '#FAFBFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  settleButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  settleButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  settleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  processingText: {
    marginLeft: 8,
  },
  loadingSpinner: {
    marginRight: 8,
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
  },
});

export default SettleBillsModal;
