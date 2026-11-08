/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  View,
  Modal,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Vibration,
  Dimensions,
  StatusBar
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import {BlurView} from '@react-native-community/blur';
import _ from 'lodash';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {useTheme} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CButton from '@components/CButton';
import {GetTypography, ToastConfig} from '@config/theme';
import {translate} from '@lang/Translate';
import GetStyles from './styles';

// Check if the platform is iOS
const IOS = Platform.OS === 'ios';
const CModal = forwardRef((props, ref) => {
  const {
    children,
    childrenViewStyle = {},
    onRequestClose = () => {},
    backgroundStyle = {},
    modalMainStyle = {},
    visible,
    modalViewStyle,

    // Confirmation Modal
    confirmationModal,
    confirmationTitle,
    confirmationDescription,
    noteTitle,
    noteTitleStyle,
    rightBtnOutline = false,
    confirmationLoader = false,
    confirmationLeftLoader = false,
    leftBtnOutline = false,
    leftBtnText = 'No',
    rightBtnText = 'Yes',
    onPressRight = () => {},
    onPressLeft = () => {},
    backHandleDisable = false,

    // Pop-Up Modal
    popUpModal = false,

    title = '',
    blurAmount = 4,
    popUpModalWithTouchable = false,
    blurDisabled = false,
    hideIndicator = false,
    titleStyle = {},
    simpleModal = false,
  } = props;

  const toastConfig = ToastConfig();
  const styles = GetStyles();
  const Typography = GetTypography();
  const {colors} = useTheme();
  const BaseColors = colors;
  const insets = useSafeAreaInsets();

  const toasterRef = useRef();

  useImperativeHandle(ref, () => ({
    showPopToast(val) {
      toasterRef?.current?.show(val);
    },
    showToast(val) {
      toasterRef?.current?.show(val, true);
    },
  }));

  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [progress, setProgress] = useState(0);

  const onRequestCloseFunc = () => {
    if (backHandleDisable) {
      setShakeEnabled(!shakeEnabled);
      if (IOS) {
        Vibration.vibrate();
      } else {
        Vibration.vibrate([1 * 50, 2 * 100, 3 * 150]);
      }
    } else {
      onRequestClose();
    }
  };

  const onAnimationEnd = () => {
    setShakeEnabled(false);
  };

  useEffect(() => {
    if (visible) {
      // Increase progress value gradually over time
      const interval = setInterval(() => {
        if (progress < 1) {
          setProgress(prevProgress => prevProgress + 0.5);
        } else {
          clearInterval(interval);
        }
      }, 60);

      return () => clearInterval(interval);
    }
  }, [visible, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress,
      [0.1, 0.2, 0.3, 1],
      [0, 0.1, 0.6, 1],
      {
        extrapolateRight: Extrapolation.CLAMP,
      },
    );
    const scale = interpolate(progress, [0, 0.1], [0, 1], {
      extrapolateRight: Extrapolation.CLAMP,
    });
    return Platform.OS === 'ios'
      ? {
          // opacity: opacity,
          // transform: [{scale: scale}],
        }
      : {};
  });

  return (
    <>
      {confirmationModal ? (
        // Bottom Modal
        <Modal
          animationType="fade"
          transparent
          statusBarTranslucent
          visible={visible}
          onRequestClose={onRequestCloseFunc}
          style={{flex: 1}}>
          <View style={{flex: 1}}>
            {visible ? (
              <Animated.View
                entering={FadeIn.duration(200).delay(1).withInitialValues(0)}
                exiting={FadeOut.duration(200).delay(1).withInitialValues(1)}
                style={[styles.absolute, animatedStyle]}>
                <BlurView
                  blurType="dark"
                  blurAmount={1}
                  style={styles.absolute}
                  reducedTransparencyFallbackColor="#00000015"
                />
              </Animated.View>
            ) : null}
            <View style={[styles.modalMainView, modalMainStyle]}>
              <TouchableOpacity
                onPress={onRequestCloseFunc}
                style={{flex: 1}}
              />
              <Animatable.View
                duration={900}
                onAnimationEnd={onAnimationEnd}
                animation={shakeEnabled && 'wobble'}
                style={[styles.modalView, modalViewStyle]}>
                {!hideIndicator && <View style={styles.barStyle} />}
                <View style={styles.confirmationModalContainer}>
                  {!_.isEmpty(confirmationTitle) &&
                  !_.isUndefined(confirmationTitle) ? (
                    <Text style={[styles.modalHeaderText]}>
                      {confirmationTitle}
                    </Text>
                  ) : null}
                  {!_.isEmpty(confirmationDescription) &&
                  !_.isUndefined(confirmationDescription) ? (
                    <View style={styles.confirmationDescriptionContainer}>
                      <Text style={[styles.modalDescriptionTxt]}>
                        {confirmationDescription}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.confirmationModalBtnContainer}>
                    <View style={styles.confirmationModalBtn}>
                      <CButton
                        whiteBgBtn={leftBtnOutline}
                        label={leftBtnText}
                        loading={confirmationLeftLoader}
                        disabled={confirmationLeftLoader || confirmationLoader}
                        onPress={onPressLeft}
                      />
                    </View>
                    <View style={styles.confirmationModalBtn}>
                      <CButton
                        outLineBtn={rightBtnOutline}
                        loading={confirmationLoader}
                        disabled={confirmationLoader || confirmationLeftLoader}
                        label={rightBtnText}
                        onPress={onPressRight}
                      />
                    </View>
                  </View>
                  {!_.isEmpty(noteTitle) && !_.isUndefined(noteTitle) ? (
                    <View
                      style={{
                        // marginTop: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={[
                          Typography.modalDescriptionMediumTxt,
                          {color: BaseColors.labelColor},
                          noteTitleStyle,
                        ]}>
                        {translate('Note')} :{' '}
                        <Text
                          style={[
                            Typography.modalDescriptionTxt,
                            {color: BaseColors.labelColor},
                          ]}>
                          {noteTitle}
                        </Text>
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Animatable.View>
            </View>
            <Toast config={toastConfig} />
          </View>
        </Modal>
      ) : popUpModal ? (
        <Modal
          visible={visible}
          animationType="fade"
          transparent
          statusBarTranslucent
          style={{flex: 1}}
          onRequestClose={onRequestCloseFunc}>
          <View style={[styles.backgroundContainer, backgroundStyle]}>
            {visible ? (
              <Animated.View
                entering={FadeIn.duration(200).delay(1).withInitialValues(0)}
                exiting={FadeOut.duration(200).delay(1).withInitialValues(1)}
                style={[styles.absolute, animatedStyle]}>
                <BlurView
                  blurType="dark"
                  blurAmount={1}
                  style={styles.absolute}
                  reducedTransparencyFallbackColor="#00000015"
                />
              </Animated.View>
            ) : null}
            <Animatable.View
              duration={900}
              animation={shakeEnabled ? 'wobble' : ''}
              onAnimationEnd={onAnimationEnd}
              style={[styles.warningModalContainer, childrenViewStyle]}>
              {children}
            </Animatable.View>
            <Toast config={toastConfig} />
          </View>
        </Modal>
      ) : popUpModalWithTouchable ? (
        <Modal
          visible={visible}
          animationType="fade"
          transparent
          statusBarTranslucent
          style={{flex: 1}}
          onRequestClose={onRequestCloseFunc}>
          <TouchableWithoutFeedback
            disabled={backHandleDisable}
            onPress={onRequestClose}>
            <View style={styles.backgroundContainer}>
              {visible ? (
                <Animated.View
                  entering={FadeIn.duration(200).delay(1).withInitialValues(0)}
                  exiting={FadeOut.duration(200).delay(1).withInitialValues(1)}
                  style={[styles.absolute, animatedStyle]}>
                  <BlurView
                    blurType="dark"
                    blurAmount={1}
                    style={styles.absolute}
                    reducedTransparencyFallbackColor="#00000015"
                  />
                </Animated.View>
              ) : null}
              <Animatable.View
                duration={900}
                animation={shakeEnabled ? 'wobble' : ''}
                onAnimationEnd={onAnimationEnd}
                style={[modalViewStyle]}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.warningModalContainer}>
                  <View style={[childrenViewStyle]}>{children}</View>
                </TouchableOpacity>
              </Animatable.View>
              <Toast config={toastConfig} />
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      ) : simpleModal ? (
        <Modal
          animationType="slide"
          transparent
          visible={visible}
          statusBarTranslucent
          onRequestClose={onRequestCloseFunc}
          style={{flex: 1}}>
          <View
            style={[
              {
                height:
                  (Dimensions.get('screen').height - StatusBar.currentHeight) /
                  1.09,
              },
              childrenViewStyle,
            ]}>
            {children}
          </View>
          <Toast config={toastConfig} />
        </Modal>
      ) : (
        // Bottom Modal
        <Modal
          animationType="slide"
          transparent
          visible={visible}
          statusBarTranslucent
          onRequestClose={onRequestCloseFunc}
          style={{flex: 1}}>
          <View style={{flex: 1}}>
            {visible && !blurDisabled ? (
              <Animated.View
                entering={FadeIn.duration(200).delay(1).withInitialValues(0)}
                exiting={FadeOut.duration(200).delay(1).withInitialValues(1)}
                style={[styles.absolute, animatedStyle]}>
                <BlurView
                  blurType="dark"
                  blurAmount={1}
                  style={styles.absolute}
                  reducedTransparencyFallbackColor="#00000015"
                />
              </Animated.View>
            ) : null}
            <View style={[styles.modalMainView, modalMainStyle]}>
              <TouchableOpacity
                onPress={onRequestCloseFunc}
                style={{flex: 1}}
              />
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
                <Animatable.View
                  duration={900}
                  animation={shakeEnabled ? 'wobble' : ''}
                  onAnimationEnd={onAnimationEnd}
                  style={[styles.modalView, modalViewStyle]}>
                  {!hideIndicator && <View style={styles.barStyle} />}
                  {!_.isEmpty(title) && (
                    <Text style={[styles.titleText, titleStyle]}>{title}</Text>
                  )}
                  <View style={[childrenViewStyle]}>{children}</View>
                </Animatable.View>
              </KeyboardAvoidingView>
              <Toast config={toastConfig} />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
});

CModal.propTypes = {
  childrenViewStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onRequestClose: PropTypes.func,
  modalMainStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  visible: PropTypes.bool,
  modalViewStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  // Confirmation Modal
  confirmationModal: PropTypes.bool,
  confirmationTitle: PropTypes.string,
  confirmationDescription: PropTypes.string,
  noteTitle: PropTypes.string,
  noteTitleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  rightBtnOutline: PropTypes.bool,
  confirmationLoader: PropTypes.bool,
  leftBtnOutline: PropTypes.bool,
  leftBtnText: PropTypes.string,
  rightBtnText: PropTypes.string,
  onPressRight: PropTypes.func,
  onPressLeft: PropTypes.func,
  backHandleDisable: PropTypes.bool,

  // Pop-Up Modal
  popUpModal: PropTypes.bool,

  // Alert Modal
  alertModal: PropTypes.bool,
  alertIconType: PropTypes.any,
  alertIconName: PropTypes.string,
  alertIconStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  alertIconContainerStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),

  title: PropTypes.string,
};

CModal.defaultProps = {
  childrenViewStyle: {},
  onRequestClose: () => {},
  modalMainStyle: {},
  visible: false,
  modalViewStyle: {},

  // Confirmation Modal
  confirmationModal: false,
  confirmationTitle: '',
  confirmationDescription: '',
  noteTitle: '',
  noteTitleStyle: {},
  confirmationLoader: false,
  confirmationLeftLoader: false,
  leftBtnText: 'No',
  rightBtnText: 'Yes',
  onPressRight: () => {},
  onPressLeft: () => {},
};
export default CModal;
