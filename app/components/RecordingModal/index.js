import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  StatusBar,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import {BaseColors, FontFamily} from '@config/theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const RecordingModal = ({
  isVisible,
  onClose,
  onRecordPress,
  onStopRecordPress,
  onSendPress,
  maxDuration = 300,
  theme = 'dark',
  showTimer = true,
  vibrate = true,
  customStyles = {},
}) => {
  const [recordingState, setRecordingState] = useState('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const timerRef = useRef(null);
  const waveformAnim = useRef(
    [...Array(12)].map(() => new Animated.Value(0)),
  ).current;

  const animateWaveform = useCallback(() => {
    const animations = waveformAnim.map((anim, i) => {
      return Animated.sequence([
        Animated.timing(anim, {
          toValue: Math.random() * 0.5 + 0.5, // Random height between 0.5 and 1
          duration: 600 + i * 50,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.2,
          duration: 600 + i * 50,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.loop(Animated.stagger(50, animations)).start();
  }, [waveformAnim]);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  useEffect(() => {
    if (recordingState === 'recording') {
      // Enhanced pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Rotating animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Progress and waveform animations
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: maxDuration * 1000,
        useNativeDriver: false,
      }).start();

      animateWaveform();

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            handleStopPress();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      if (vibrate) {
        Vibration.vibrate(100);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState]);

  const handleRecordPress = () => {
    setRecordingState('recording');
    if (vibrate) Vibration.vibrate(100);
    onRecordPress?.();
  };

  const handleStopPress = () => {
    setRecordingState('stopped');
    if (vibrate) Vibration.vibrate([0, 50, 50, 50]);
    onStopRecordPress?.();
    clearInterval(timerRef.current);
  };

  const handleSendPress = () => {
    setRecordingState('idle');
    setRecordingTime(0);
    if (vibrate) Vibration.vibrate(50);
    onSendPress?.();
    onClose();
  };
  const handleCancelPress = () => {
    setRecordingState('idle');
    setRecordingTime(0);
    if (vibrate) Vibration.vibrate(50);
    clearInterval(timerRef.current);

    // Reset animations
    pulseAnim.setValue(1);
    rotateAnim.setValue(0);
    progressAnim.setValue(0);
    waveformAnim.forEach(anim => anim.setValue(0.2));

    onClose();
  };
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getThemeColors = () => {
    return theme === 'dark'
      ? {
          background: '#171717',
          text: '#FFFFFF',
          primary: '#3B82F6',
          secondary: '#27272A',
          accent: '#EF4444',
          gradient: ['#3B82F6', '#8B5CF6'],
        }
      : {
          background: '#FFFFFF',
          text: '#171717',
          primary: '#3B82F6',
          secondary: '#F4F4F5',
          accent: '#EF4444',
          gradient: ['#3B82F6', '#8B5CF6'],
        };
  };

  const colors = getThemeColors();

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const dynamicStyles = StyleSheet.create({
    modalContent: {
      backgroundColor: colors.background,
      ...customStyles.modalContent,
    },
    title: {
      color: colors.text,
      ...customStyles.title,
    },
    timerText: {
      color: colors.text,
      ...customStyles.timerText,
    },
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent>
      <BlurView
        style={styles.blurContainer}
        blurType={colors.blur}
        blurAmount={20}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
            customStyles.container,
          ]}>
          {recordingState === 'idle' && (
            <Text
              style={[
                styles.recordingText,
                {color: BaseColors.white, bottom: 30},
              ]}>
              Press to Record
            </Text>
          )}
          <LinearGradient
            colors={colors.gradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientBorder}>
            <View style={[styles.modalContent, dynamicStyles.modalContent]}>
              {/* Recording Indicator */}

              {recordingState === 'recording' && (
                <View style={styles.recordingIndicator}>
                  <Animated.View
                    style={[
                      styles.recordingDot,
                      {backgroundColor: colors.accent},
                      {transform: [{scale: pulseAnim}]},
                    ]}
                  />
                  <Text style={[styles.recordingText, {color: colors.accent}]}>
                    Recording
                  </Text>
                </View>
              )}

              {/* Timer */}
              {showTimer && recordingState !== 'idle' && (
                <Text style={[styles.timerText, dynamicStyles.timerText]}>
                  {formatTime(recordingTime)}
                </Text>
              )}

              {/* Waveform */}
              {recordingState === 'recording' && (
                <View style={styles.waveformContainer}>
                  {waveformAnim.map((anim, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.waveformBar,
                        {
                          backgroundColor: colors.primary,
                          transform: [
                            {
                              scaleY: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.2, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
              {/* Progress Ring */}
              {recordingState === 'recording' && (
                <Animated.View
                  style={[
                    styles.progressRing,
                    {
                      borderColor: colors.primary,
                      transform: [{rotate: spin}],
                    },
                  ]}
                />
              )}

              {/* Controls */}
              <View style={styles.controls}>
                {recordingState === 'idle' && (
                  <TouchableOpacity
                    style={[
                      styles.recordButton,
                      {backgroundColor: colors.accent},
                    ]}
                    onPress={handleRecordPress}
                    activeOpacity={0.8}>
                    <IconIonicons name="mic" size={32} color="#FFF" />
                  </TouchableOpacity>
                )}

                {recordingState === 'recording' && (
                  <Animated.View
                    style={[
                      styles.recordingContainer,
                      {
                        transform: [{scale: pulseAnim}],
                      },
                    ]}>
                    <TouchableOpacity
                      style={[
                        styles.stopButton,
                        {backgroundColor: colors.accent},
                      ]}
                      onPress={handleStopPress}>
                      <Icon name="stop" size={32} color="#FFF" />
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {recordingState === 'stopped' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButtonContainer}
                      onPress={handleSendPress}>
                      <LinearGradient
                        colors={colors.gradient}
                        style={styles.actionButton}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}>
                        <IconFeather name="send" size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Send</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {backgroundColor: colors.secondary},
                      ]}
                      onPress={handleCancelPress}>
                      <IconFeather name="x" size={24} color={colors.text} />
                      <Text
                        style={[styles.actionButtonText, {color: colors.text}]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    padding: 24,
    borderRadius: 30,
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  timerText: {
    fontSize: 48,
    marginBottom: 24,
    fontFamily: FontFamily.medium,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    marginBottom: 24,
  },
  waveformBar: {
    width: 4,
    height: 40,
    borderRadius: 4,
    marginHorizontal: 2,
    overflow: 'hidden',
  },
  waveformBarInner: {
    flex: 1,
    width: '100%',
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '90%',
    borderWidth: 2,
    top: 40,
    borderRadius: 30,
    borderStyle: 'dashed',
  },
  controls: {
    alignItems: 'center',
    marginTop: 8,
  },
  recordButtonContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  actionButtonContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 30,
    minWidth: 130,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: FontFamily.bold,
  },
});

export default RecordingModal;
