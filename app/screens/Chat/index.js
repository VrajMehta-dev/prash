/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import {Images} from '@config/images';
import BaseSetting from '@config/setting';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {isArray, isEmpty} from 'lodash';
import LottieView from 'lottie-react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import {RefreshControl} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import authActions from '@redux/reducers/auth/actions';
import {store} from '@redux/store/configureStore';
const HEADER_HEIGHT = 150;

const Chat = () => {
  const navigation = useNavigation();

  const scrollY = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const socketObj = useSelector(state => state.socket?.socketObj);
  const {setActiveScreen} = authActions;

  console.log('socketObj', socketObj);

  const [conversationList, setConversationList] = useState([]);
  console.log('conversationList', conversationList);
  const [refreshing, setRefreshing] = useState(false);
  const [chatLoader, setChatLoader] = useState(false);

  // Calculate sheet animations
  const sheetAnimation = {
    shadowOpacity: scrollY.interpolate({
      inputRange: [0, 50],
      outputRange: [0.3, 0.15],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0],
          outputRange: [0, 0],
          extrapolateLeft: 'extend',
        }),
      },
    ],
  };

  useEffect(() => {
    if (!isEmpty(userData)) {
      userConnect();
      receiveMsg();
    }
  }, [socketObj]);
  useEffect(() => {
    receiveTyping();
    receiveStopTyping();
  }, [socketObj]);
  useFocusEffect(
    React.useCallback(() => {
      userConnect('back');
      store.dispatch(setActiveScreen('Chat'));
    }, []),
  );
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setChatLoader(true);
    userConnect();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  const {userData} = useSelector(state => state.auth);
  const receiveMsg = () => {
    socketObj?.on('receiveMessage', req => {
      userConnect('back');
    });
  };
  const [typingData, setTypingData] = useState({});

  const receiveTyping = () => {
    socketObj?.on('receiveTyping', req => {
      setTypingData(req);
    });
  };

  const receiveStopTyping = () => {
    socketObj?.on('receiveStopTyping', (obj, res) => {
      setTypingData({});
    });
  };
  // this function for get conversation list
  const userConnect = async type => {
    try {
      if (type?.trim() !== 'back') {
        setChatLoader(true);
      }
      if (socketObj !== null) {
        const obj = {
          user_id: userData?.id,
          page: 1,
        };
        console.log('socketObj', socketObj);
        socketObj?.emit('initializeSocket', obj, dataForChatList => {
          try {
            if (
              !isEmpty(dataForChatList?.data?.user_data) &&
              isArray(dataForChatList?.data?.user_data)
            ) {
              const sortedConversations = dataForChatList?.data?.user_data
                .slice()
                .sort((a, b) => {
                  return b.createdAt - a.createdAt; // Sort based on createdAt field
                });
              setChatLoader(false);

              console.log('sortedConversations', sortedConversations);
              // Update the state with the sorted conversations
              setConversationList(sortedConversations);
            } else {
              setConversationList([]);
              console.log('heheh');
              setChatLoader(false);
            }
          } catch (error) {
            console.error('Error processing chat list data:', error);
            setChatLoader(false);
          }
        });
      }
    } catch (error) {
      console.error('Error connecting to socket:', error);
      setChatLoader(false);
    }
  };
  const MessageItem = ({item}) => {
    console.log('item', item);
    return (
      <Animated.View
        style={[
          styles.messageItem,
          {
            paddingVertical: 12,
            opacity: scrollY.interpolate({
              inputRange: [-1, 0, contentHeight],
              outputRange: [1, 1, 0.5],
            }),
          },
        ]}>
        <TouchableOpacity
          onPress={() => {
            navigation?.navigate('ChatMessage', {item});
            store.dispatch(setActiveScreen('ChatMessage'));

            navigation.navigate('ChatMessage', {
              name: item?.name,
              convId: item?.conv_id,
              image: item?.photo?.includes('https')
                ? item.photo
                : BaseSetting.imgUrl + item.photo ||
                  'https://i.ibb.co/chSG40V/user-image-l-3x.png',
              reciever_id: item?.user_id,
              isNew: item.newMsg || false,
            });
            userConnect('back');
          }}
          style={styles.messageItem}>
          <Image
            source={{
              uri: item?.photo?.includes('https')
                ? item.photo
                : BaseSetting.imgUrl + item.photo ||
                  'https://i.ibb.co/chSG40V/user-image-l-3x.png',
            }}
            style={styles.avatar}
          />
          <View style={styles.messageContent}>
            <Text style={styles.name}>{item.name}</Text>
            {!isEmpty(typingData) &&
            typingData?.sender_id !== userData?.id &&
            typingData?.conv_id === item?.conv_id ? (
              <Text style={styles.name}>Typing...</Text>
            ) : (
              <Text style={styles.messageText}>
                {item.type == 'image' ? 'Sent a image' : item.text || 'Sent audio'}
              </Text>
            )}
          </View>
          <View style={styles.rightContent}>
            <Text style={styles.time}>{item.formatted_time}</Text>
            {item.unRead > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unRead}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Message's ({conversationList?.length})
          </Text>
        </View>
        <Animated.View style={[styles.sheetContainer, sheetAnimation]}>
          <View style={styles.sheetIndicator} />
          {chatLoader ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size={'large'} color={'#6366F1'} />
            </View>
          ) : (
            <Animated.FlatList
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              data={conversationList}
              renderItem={({item}) => <MessageItem item={item} />}
              keyExtractor={item => item?.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => {
                return (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: Dimensions.get('window').height / 1.8,
                    }}>
                    <LottieView
                      style={{width: 290, height: 290}}
                      source={Images?.noDataAvail}
                      autoPlay
                      loop
                    />
                  </View>
                );
              }}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {y: scrollY}}}],
                {useNativeDriver: true},
              )}
              scrollEventThrottle={16}
              bounces={true}
              onContentSizeChange={(_, height) => setContentHeight(height)}
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: HEADER_HEIGHT,
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  sheetContainer: {
    backgroundColor: '#fff',
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sheetIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6', // Placeholder background
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#6B7280',
  },
  rightContent: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#6B46C1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Chat;
