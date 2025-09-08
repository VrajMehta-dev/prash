/* eslint-disable no-shadow */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Text,
  ActivityIndicator,
  Animated,
  Keyboard,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import EmojiPicker from 'rn-emoji-keyboard';
import * as Animatable from 'react-native-animatable';
import RNFS from 'react-native-fs';
import {GiftedChat, Bubble, Send, Time} from 'react-native-gifted-chat';
import LinearGradient from 'react-native-linear-gradient';
import authActions from '@redux/reducers/auth/actions';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {isArray, isEmpty} from 'lodash';
import CChatInput from '@components/CChatInput';
import {BaseColors} from '@config/theme';
import ImagePicker from 'react-native-image-crop-picker';
import {getApiDataProgress} from '@utils/apiHelper';
import ViewImageModal from '@components/ViewImageModal';
import Toast from 'react-native-toast-message';
import BaseSetting from '@config/setting';
import styles from './styles';
import RecordingModal from '@components/RecordingModal';

// const audioRecorderPlayer = new AudioRecorderPlayer();
const ChatMessage = ({navigation, route}) => {
  const [messages, setMessages] = useState([]);
  console.log('messages', JSON.stringify(messages));
  const [message, setMessage] = useState('');
  const [isEmojiKeyboardOpen, setIsEmojiKeyboardOpen] = useState(false);

  const {name} = route.params;
  const convId = route?.params.convId;
  const image = route?.params.image;
  const reciever_id = route?.params.reciever_id || '';
  const dispatch = useDispatch();
  const socketObj = useSelector(state => state.socket?.socketObj);
  const {userData, activeScreen} = useSelector(state => state.auth);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState({});
  const [imageModal, setImageModal] = useState({visible: false, url: ''});

  const [typingData, setTypingData] = useState({});
  const {setActiveScreen} = authActions;
  const [currentPage, setCurrentPage] = useState(1);
  const [chatData, setChatData] = useState(null);
  const [pageLoad, setPageLoad] = useState(true);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    receiveTyping();
    receiveStopTyping();
  }, [socketObj]);

  useEffect(() => {
    receiveTyping();
    receiveStopTyping();
  }, []);

  // this useEffect is use for typing nad stopTyping function call
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other
        isTyping();
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
        stopTyping();
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [typingData, socketObj, keyboardVisible]);

  const isTyping = () => {
    const obj = {
      sender_id: userData?.id,
      receiver_id: reciever_id,
      conv_id: convId,
    };
    socketObj?.emit('isTyping', obj, callBackData => {});
  };
  // this function is for emit call of receving typing the user

  const receiveTyping = () => {
    socketObj?.on('receiveTyping', req => {
      setTypingData(req);
    });
  };
  // this function is for emit call of stop typing the user

  const stopTyping = () => {
    const obj = {
      sender_id: userData?.id,
      receiver_id: reciever_id,
      conv_id: convId,
    };
    socketObj?.emit('stopTyping', obj, callBackData => {
      console.log('callBackData ==>>>', callBackData);
    });
  };
  // this function is for emit call of  receving stop typing the user

  const receiveStopTyping = () => {
    socketObj?.on('receiveStopTyping', (obj, res) => {
      setTypingData({});
    });
  };

  useEffect(() => {
    if (activeScreen === 'ChatMessage') {
      SingleChat(convId, 1, true, true, userData?.id);
    }
  }, []);

  useEffect(() => {
    const handleReceiveMessage = req => {
      console.log('req', req);
      console.log('xxx', userData.id == req?.receiver_id);
      console.log('Received message:', req);
      SingleChat(convId, 1, false, true, req?.receiver_id);
    };

    const receiveMsg = () => {
      socketObj?.on('receiveMessage', handleReceiveMessage);
    };

    // Listen for the 'ChatScreen' focus state
    const focusListener = navigation.addListener('focus', () => {
      if (activeScreen === 'ChatMessage') {
        receiveMsg();
      }
      console.log('activeScreen', activeScreen);
    });

    // Clean up: remove the listener when component unmounts
    return () => {
      socketObj?.off('receiveMessage', handleReceiveMessage); // Remove the specific event listener
      focusListener(); // Remove the focus listener
    };
  }, [activeScreen, convId, navigation]); // Dependency array ensures callback is recreated when these values change

  const messageSeen = receiver => {
    const dataForRead = {
      conv_id: convId,
      user_id: receiver,
    };
    socketObj.emit('messageReadAll', dataForRead, req => {});
  };
  const handleGoBack = () => {
    dispatch(setActiveScreen('Chat'));
    navigation.goBack();
  };
  const [recording, setRecording] = useState(false);
  const [storedAudio, setStoredAudio] = useState(null);

  const startRecording = async () => {
    setRecording(true);
    // await audioRecorderPlayer.startRecorder();
  };

  const stopRecording = async () => {};
  const handleSendAudio = async audioPath => {
    if (!audioPath) {
      console.error('No audio file path provided.');
      return;
    }

    const tempMessageId = Date.now().toString();

    // Create a temporary message
    const tempMessage = {
      _id: tempMessageId,
      audio: `file://${audioPath}`, // Ensure it's in file URI format
      createdAt: new Date(),
      user: {_id: 1, name: 'Me'},
      status: 'pending',
    };

    try {
      const file = {
        uri: `file://${audioPath}`,
        type: 'audio/m4a',
        name: `audio-${tempMessageId}.m4a`,
      };

      const data = {
        sender_id: userData?.id,
        receiver_id: reciever_id,
        conv_id: convId,
        type: 'audio',
        image: file,
      };
      console.log('data', data);

      const endpoint =
        BaseSetting.socketServer + BaseSetting.endpoints.chatImgSend; // Fix: Correct API endpoint

      const result = await getApiDataProgress(
        endpoint,
        'POST',
        data,
        {},
        () => {},
        true,
      );

      console.log('Audio upload result:', result);
      if (result?.status) {
        SingleChat(convId, 1, false, false);
      } else {
        throw new Error(result?.message || 'Failed to send audio');
      }
    } catch (error) {
      console.error('Audio upload failed:', error);
    }
  };

  const handleImageFromCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 1024,
        height: 1024,
        cropping: true,
        cropperCircleOverlay: false,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      const file = {
        uri: image.path,
        type: image.mime,
        name: `camera_${Date.now()}.${image.mime.split('/')[1]}`,
      };

      handleSendImage(file);
      setShowAttachments(false);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error capturing image',
        });
      }
    }
  };

  const handleImageFromGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 1024,
        height: 1024,
        cropping: true,
        cropperCircleOverlay: false,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      const file = {
        uri: image.path,
        type: image.mime,
        name: `gallery_${Date.now()}.${image.mime.split('/')[1]}`,
      };

      handleSendImage(file);
      setShowAttachments(false);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error selecting image',
        });
      }
    }
  };

  const handleSendImage = async file => {
    const tempMessageId = Date.now().toString();

    // Create a temporary message
    const tempMessage = {
      _id: tempMessageId,
      image: file.uri, // Local URI
      createdAt: new Date(),
      user: {
        _id: 1,
        name: 'Me',
      },
      status: 'pending', // Initial status
    };

    // Append temporary message
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [tempMessage]),
    );
    setLoadingMessages(prev => ({...prev, [tempMessageId]: true}));

    try {
      const endpoint =
        BaseSetting.socketServer + BaseSetting.endpoints.chatImgSend;
      const data = {
        sender_id: userData?.id,
        receiver_id: reciever_id,
        conv_id: convId,
        type: 'image',
        image: file,
      };

      const result = await getApiDataProgress(
        endpoint,
        'POST',
        data,
        {},
        () => {},
        true,
      );

      if (result?.status) {
        // Update the existing message properties
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const messageIndex = updatedMessages.findIndex(
            msg => msg._id === tempMessageId,
          );
          if (messageIndex !== -1) {
            updatedMessages[messageIndex].status = 'sent';
            updatedMessages[messageIndex].image = result.imageUrl; // Update image URL
          }
          return updatedMessages;
        });
      } else {
        throw new Error(result?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload failed:', error);

      // Mark message as failed
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const messageIndex = updatedMessages.findIndex(
          msg => msg._id === tempMessageId,
        );
        if (messageIndex !== -1) {
          updatedMessages[messageIndex].status = 'failed'; // Set to failed
        }
        return updatedMessages;
      });

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to upload image',
      });
    } finally {
      // Remove loading state
      setLoadingMessages(prev => {
        const newState = {...prev};
        delete newState[tempMessageId];
        return newState;
      });
    }
  };

  const handleOptionSelect = async option => {
    // Close the attachments modal first
    setShowAttachments(false);

    // Add a small delay before opening picker
    setTimeout(() => {
      switch (option.label) {
        case 'Gallery':
          handleImageFromGallery();
          break;
        case 'Camera':
          handleImageFromCamera();
          break;
        case 'Audio':
          // startRecording();
          setIsModalVisible(true);
          break;
        default:
          stopRecording();
          console.log('Selected:', option.label);
      }
    }, 300);
  };
  const SingleChat = (
    type = '',
    page = currentPage,
    loader,
    callMessageSeen = false,
    id = '',
  ) => {
    if (loader) {
      setPageLoad(true);
    }
    if (socketObj !== null) {
      const obj = {
        user_id: userData?.id,
        conv_id: convId,
        page: Number(page),
      };

      socketObj?.emit('singleConversation', obj, dataForChatList => {
        setChatData(dataForChatList);
        setIsLoadingEarlier(false);

        const newMessages = dataForChatList?.data?.getMessage.map(message => ({
          _id: message.id,
          text: message.text,
          createdAt: message.created_at,
          user: {
            _id: userData.id == message.sender_id ? 1 : 2,
            name: userData.id == message.sender_id ? 'M e' : message.name,
          },
          is_read: message?.is_read,
          image: message?.image_name || null,
          audio: message?.audio_name || null,
        }));

        setMessages(prevMessages => {
          const sortedMessages = newMessages.sort(
            (a, b) => b?.createdAt - a?.createdAt,
          );

          if (page === 1) {
            // First page: Replace all messages
            return sortedMessages;
          } else {
            // Pagination: Add only unique messages
            const existingIds = new Set(prevMessages.map(m => m._id));
            const filteredNewMessages = sortedMessages.filter(
              m => !existingIds.has(m._id),
            );

            const lastMessageId = prevMessages[prevMessages.length - 1]?._id;
            const isAtLastPage = newMessages.some(m => m._id === lastMessageId);

            if (isAtLastPage) {
              return [...filteredNewMessages, ...prevMessages].sort(
                (a, b) => b?.createdAt - a?.createdAt,
              );
            }

            return [...prevMessages, ...filteredNewMessages].sort(
              (a, b) => b?.createdAt - a?.createdAt,
            );
          }
        });

        setPageLoad(false);
        if (callMessageSeen) {
          messageSeen(id);
        }
      });
    }
  };

  const onSend1 = useCallback(
    messageText => {
      if (socketObj !== null) {
        const newMessage = {
          _id: new Date().getTime(),
          text: messageText,
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'Me',
          },
        };

        const obj = {
          text: messageText,
          type: 'text',
          sender_id: userData?.id,
          receiver_id: reciever_id,
          conv_id: convId,
        };
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, [newMessage]),
        );
        socketObj?.emit('sendMessage', obj, dataForChatList => {
          if (dataForChatList?.status) {
            SingleChat(convId, 1, false, false);
            setCurrentPage(1);
          } else {
            navigation?.navigate('Chat');
          }
          // userConnect();
        });
      }
    },
    [socketObj, userData, reciever_id, convId, navigation],
  );

  const renderLoading = () => {
    if (isLoadingEarlier) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="small" color={'purple'} />
        </View>
      );
    }
  };
  const handleRetryImage = async failedMessage => {
    const {_id, image} = failedMessage;

    // Show loading state again
    setLoadingMessages(prev => ({...prev, [_id]: true}));

    try {
      const file = {
        uri: image,
        type: 'image/jpeg', // Adjust dynamically if needed
        name: `retry_${Date.now()}.jpg`,
      };

      const endpoint =
        BaseSetting.socketServer + BaseSetting.endpoints.chatImgSend;
      const data = {
        sender_id: userData?.id,
        receiver_id: reciever_id,
        conv_id: convId,
        type: 'image',
        image: file,
      };

      const result = await getApiDataProgress(
        endpoint,
        'POST',
        data,
        {},
        () => {},
        true,
      );

      if (result?.status) {
        SingleChat(convId, 1, false, false);

        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === _id
              ? {...msg, status: 'sent', image: result.imageUrl}
              : msg,
          ),
        );
      } else {
        throw new Error(result?.message || 'Failed to resend image');
      }
    } catch (error) {
      console.error('Retry failed:', error);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Retry failed. Check your network.',
      });

      // Keep message status as 'failed'
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === _id ? {...msg, status: 'failed'} : msg,
        ),
      );
    } finally {
      // Remove loading state
      setLoadingMessages(prev => {
        const newState = {...prev};
        delete newState[_id];
        return newState;
      });
    }
  };
  const AttachmentPopover = ({visible, onClose, position, onOptionSelect}) => {
    const options = [
      {icon: 'camera', label: 'Camera', color: '#4CAF50'},
      {icon: 'image', label: 'Gallery', color: '#9C27B0'},
      {icon: 'mic', label: 'Audio', color: '#2196F3'},
      {icon: 'file', label: 'Document', color: '#607D8B'},
      {icon: 'map-pin', label: 'Location', color: '#FF5722'},
      // {icon: 'user', label: 'Contact', color: '#FFC107'},
    ];

    const translateY = new Animated.Value(50);

    React.useEffect(() => {
      if (visible) {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }, [visible]);
    const handleOptionPress = option => {
      onOptionSelect(option); // Call the callback with selected option
      onClose(); // Close the popover after selection
    };

    if (!visible) return null;

    return (
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={onClose}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Animated.View
            style={[
              styles.popoverContainer,
              {bottom: position.bottom, transform: [{translateY}]},
            ]}>
            <View style={styles.gridContainer}>
              {options.map(option => (
                <TouchableOpacity
                  key={option.label}
                  style={styles.optionWrapper}
                  onPress={() => handleOptionPress(option)}>
                  <View
                    style={[
                      styles.iconCircle,
                      {backgroundColor: option.color},
                    ]}>
                    <Icon name={option.icon} size={24} color="white" />
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  };
  const AudioMessagePlayer = ({
    position = 'right',
    currentMessage,
    audioRecorderPlayer,
  }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress] = useState(new Animated.Value(0));
    const [duration, setDuration] = useState('0:00');
    const [currentPosition, setCurrentPosition] = useState(0);

    useEffect(() => {
      let subscription;
      if (isPlaying) {
        // Start playing and handle progress updates
        audioRecorderPlayer.startPlayer(currentMessage.audio);
        subscription = audioRecorderPlayer.addPlayBackListener(e => {
          const currentSec = Math.floor(e.currentPosition / 1000);
          const totalSec = Math.floor(e.duration / 1000);
          setCurrentPosition(currentSec);

          // Update progress animation based on actual playback
          progress.setValue(currentSec / totalSec);

          // If reached the end, stop playing
          if (currentSec >= totalSec) {
            handleStop();
          }
        });
      }

      return () => {
        if (subscription) {
          subscription.remove();
        }
      };
    }, [isPlaying]);

    const handlePlayback = () => {
      if (isPlaying) {
        handleStop();
      } else {
        setIsPlaying(true);
      }
    };

    const handleStop = async () => {
      setIsPlaying(false);
      await audioRecorderPlayer.stopPlayer();
      progress.setValue(0); // Reset progress bar
      setCurrentPosition(0);
    };

    const progressWidth = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    // Format current position time
    const formatTime = seconds => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
      <View
        style={[
          styles.container2,
          position === 'right' ? styles.rightContainer : styles.leftContainer,
        ]}>
        <TouchableOpacity
          onPress={handlePlayback}
          style={[
            styles.playButton,
            position === 'right'
              ? styles.rightPlayButton
              : styles.leftPlayButton,
          ]}>
          <MaterialIcons
            name={isPlaying ? 'stop' : 'play'}
            size={24}
            color={position === 'right' ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressBar,
                {width: progressWidth},
                position === 'right'
                  ? styles.rightProgressBar
                  : styles.leftProgressBar,
              ]}
            />
          </View>
          <View style={styles.waveform}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  {height: Math.random() * 15 + 5},
                  position === 'right'
                    ? styles.rightWaveformBar
                    : styles.leftWaveformBar,
                ]}
              />
            ))}
          </View>
          <Text
            style={[
              styles.duration,
              position === 'right' ? styles.rightText : styles.leftText,
            ]}>
            {isPlaying ? formatTime(currentPosition) : duration}
          </Text>
        </View>
      </View>
    );
  };

  const renderBubble = props => {
    const {currentMessage} = props;
    console.log('currentMessage', currentMessage);

    if (currentMessage.audio) {
      return (
        <View
          style={[
            styles.audioBubble,
            props.position === 'left' ? styles.leftBubble : styles.rightBubble,
          ]}>
          <AudioMessagePlayer
            position={props.position}
            currentMessage={currentMessage}
            audioRecorderPlayer={{}}
          />
        </View>
      );
    }
    if (currentMessage.image) {
      return (
        <View
          style={[
            styles.imageBubble,
            props.position === 'left' ? styles.leftBubble : styles.rightBubble,
          ]}>
          <TouchableOpacity
            onPress={() =>
              setImageModal({visible: true, url: currentMessage.image})
            }
            activeOpacity={0.8}>
            <Animatable.Image
              animation="fadeIn"
              duration={1500}
              source={{uri: currentMessage.image}}
              style={styles.messageImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Loading Indicator */}
          {loadingMessages[currentMessage._id] && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          )}

          {/* Retry Button for Failed Messages */}
          {currentMessage.status === 'failed' && (
            <TouchableOpacity
              style={styles.retryContainer}
              onPress={() => handleSendImage({uri: currentMessage.image})}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {backgroundColor: '#F3F4F6', borderRadius: 16, marginBottom: 4},
          right: {
            backgroundColor: '#E9D5FF',
            borderRadius: 16,
            marginBottom: 4,
          },
        }}
        textStyle={{
          left: {color: '#374151', fontSize: 15},
          right: {color: '#374151', fontSize: 15},
        }}
      />
    );
  };
  const handleRecordPress = () => {
    startRecording();
  };

  const handleStopPress = () => {
    stopRecording();
  };

  const handleSendPress = () => {
    handleSendAudio(storedAudio);
    console.log('Your recording has been sent successfully!');
  };
  const renderSend = props => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <Icon name="send" size={24} color="#0EA5E9" style={styles.sendIcon} />
      </Send>
    );
  };
  const renderTime = props => {
    return (
      <Time
        {...props}
        timeTextStyle={{
          left: {color: '#6B7280', fontSize: 12},
          right: {color: '#6B7280', fontSize: 12},
        }}
        format="h:mm A"
      />
    );
  };

  return (
    <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => handleGoBack()}>
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Image source={{uri: image}} style={styles.avatar} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{name}</Text>
              <Text style={styles.headerStatus}>online</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="phone" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="more-vertical" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chatContainer}>
          <GiftedChat
            messages={messages}
            onSend={messages => onSend1(messages[0].text)}
            user={{_id: 1}}
            renderBubble={renderBubble}
            inverted
            renderAvatar={null}
            renderInputToolbar={() => {
              return (
                <CChatInput
                  value={message}
                  onChangeText={val => {
                    setMessage(val);
                  }}
                  onPressEmoji={() => {
                    setIsEmojiKeyboardOpen(true);
                  }}
                  onAttachClick={() => {
                    setShowAttachments(true);
                  }}
                  onSend={() => {
                    if (message.trim() !== '') {
                      onSend1(message);
                      setMessage('');
                    }
                  }}
                />
              );
            }}
            renderSend={renderSend}
            renderTime={renderTime}
            alignTop={true}
            listViewProps={{
              showsVerticalScrollIndicator: false,
              alwaysBounceVertical: false,
            }}
            alwaysShowSend
            bottomOffset={Platform.select({ios: 30, android: 0})}
            messagesContainerStyle={styles.messagesContainer}
            textInputStyle={styles.textInput}
            minInputToolbarHeight={60}
            loadEarlier={true}
            isLoadingEarlier={isLoadingEarlier}
            isTyping={
              !isEmpty(typingData) &&
              typingData?.sender_id !== userData?.id &&
              typingData?.conv_id === convId
            }
            onLoadEarlier={() => {
              if (
                chatData?.data?.pagination?.isMore === true &&
                !isLoadingEarlier
              ) {
                setIsLoadingEarlier(true);
                setCurrentPage(prevPage => {
                  const nextPage = prevPage + 1;
                  SingleChat(convId, nextPage, false, true);
                  return nextPage;
                });
              }
            }}
            infiniteScroll={true}
            renderLoadEarlier={renderLoading}
            // isTyping={true}
          />
        </View>
        <AttachmentPopover
          visible={showAttachments}
          onClose={() => setShowAttachments(false)}
          position={{bottom: 115}}
          onOptionSelect={handleOptionSelect}
        />

        <EmojiPicker
          onEmojiSelected={v => {
            const emoji = v?.emoji;
            setMessage(preVal => preVal.concat(emoji));
          }}
          backModalOverlay={false}
          open={isEmojiKeyboardOpen}
          onClose={() => setIsEmojiKeyboardOpen(false)}
          enableRecentlyUsed
          // enableSearchBar
          allowMultipleSelections
          // hideHeader
          theme={{
            container: BaseColors.white,
            knob: BaseColors.white,
            category: {
              icon: BaseColors.secondary,
              iconActive: BaseColors.white,
              // container: BaseColors.white,
              containerActive: BaseColors.primaryLight,
            },
          }}
          enableCategoryChangeGesture={false}
          categoryPosition="top"
        />
        {imageModal?.visible && (
          <ViewImageModal
            visible={imageModal.visible}
            handleModal={() => {
              setImageModal({visible: false, url: ''});
            }}
            imgUrl={imageModal?.url}
          />
        )}
        <RecordingModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onRecordPress={handleRecordPress}
          onStopRecordPress={handleStopPress}
          onSendPress={handleSendPress}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ChatMessage;
