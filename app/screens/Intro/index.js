import Icon, {Icons} from '@config/Icons';
import BaseSetting from '@config/setting';
import {FontFamily} from '@config/theme';
import {initTranslate, translate} from '@lang/Translate';
import languageAction from '@redux/reducers/language/actions';
import {store} from '@redux/store/configureStore';
import {getApiData, getApiDataProgress} from '@utils/apiHelper';
import React, {useState, useEffect, useReducer} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Animated,
  Easing,
  Modal,
  Dimensions,
  FlatList
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import {SvgXml} from 'react-native-svg';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';

const languages = [
  {
    id: '1',
    name: 'English',
    code: 'en',
    flag: 'https://www.countryflags.com/wp-content/uploads/united-states-of-america-flag-png-large.png',
  },
  {
    id: '2',
    name: 'Spanish',
    code: 'es',
    flag: 'https://cdn.countryflags.com/thumbs/spain/flag-square-250.png',
  },
  {
    id: '3',
    name: 'French',
    code: 'fr',
    flag: 'https://cdn.countryflags.com/thumbs/france/flag-square-250.png',
  },
  {
    id: '4',
    name: 'German',
    code: 'de',
    flag: 'https://cdn.countryflags.com/thumbs/germany/flag-square-250.png',
  },
  {
    id: '5',
    name: 'Italian',
    code: 'it',
    flag: 'https://cdn.countryflags.com/thumbs/italy/flag-square-250.png',
  },
];

export default function IntroScreen({navigation}) {
  const [scaleValue] = useState(new Animated.Value(1));
  const [floatValue] = useState(new Animated.Value(0));
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [languageList, setLanguageList] = useState([]);
  console.log('languageList', languageList);
  const [selectedLanguageState, setSelectedLanguageState] = useState(null); // Changed to null initially
  console.log('selectedLanguageState', selectedLanguageState);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const {selectedLanguage, code} = useSelector(state => state.language);
  const [slideAnim] = useState(
    new Animated.Value(Dimensions.get('window').height),
  );
  useEffect(() => {
    getTranslationList();
  }, []);
  async function getTranslationList() {
    try {
      const endpoint = BaseSetting.endpoints.translationList;
      const response = await getApiData(endpoint, 'GET');
      console.log('response', response);

      if (response?.status) {
        setLanguageList(response?.data);
      } else {
        Toast.show({
          type: 'error',
          text2: response?.message,
        });
        setLanguageList([]);
        // setBtnLoader(false);
      }
    } catch (er) {
      console.log('er=======', er);
      // setBtnLoader(false);
    }
  }

  // Function to FollowUser
  const Translation = async id => {
    try {
      const endpoint = `${BaseSetting.endpoints.translationData}?language_id=${id}`;
      const result = await getApiData(endpoint, 'GET');
      console.log('result', result);

      if (result?.status) {
        // store.dispatch(languageAction.setDeviceDefaultLanguage(false));
        console.log('🚀 ~ IntroScreen ~ id:', id);
        store.dispatch(languageAction.setLanguage(id, result?.data));
        console.log('result?.data', result?.data);
        initTranslate(store, false);
        forceUpdate();
        Toast.show({
          type: 'success',
          text1: 'Error',
          text2: result?.message,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result?.message,
        });
      }
    } catch (error) {
      // Handle API call error
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message,
      });
    }
  };
  // Animation for button press
  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      onPressOut();
    }, 200);
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Floating animation setup
  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    floatAnimation.start();

    return () => floatAnimation.stop();
  }, []);

  // Modal animation
  useEffect(() => {
    if (isLanguageModalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLanguageModalVisible]);

  // Interpolate floating animation
  const floatTranslateY = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const handleLanguagePress = () => {
    onPressIn();
    setIsLanguageModalVisible(true);
  };

  const renderLanguageItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguageState?.id === item.id && styles.selectedLanguageItem,
      ]}
      onPress={() => {
        setSelectedLanguageState(item);
        setIsLanguageModalVisible(false);
        Translation(item?.language_id);
      }}>
      <Image
        source={{
          uri:
            item?.country_flag ||
            'https://cdn.countryflags.com/thumbs/italy/flag-square-250.png',
        }}
        style={styles.flag}
        resizeMode="cover"
      />
      <View style={styles.languageInfo}>
        <Text style={styles.languageName}>{item?.name}</Text>
        <Text style={styles.languageCode}>
          {item?.country_code.toUpperCase()}
        </Text>
      </View>
      {selectedLanguageState?.id === item.id ? (
        <Icon
          type={Icons.Ionicons}
          name="checkmark-circle"
          size={24}
          color="#000033"
        />
      ) : (
        <Icon
          type={Icons.Ionicons}
          name="chevron-forward"
          size={24}
          color="#CCCCCC"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={handleLanguagePress}
          activeOpacity={0.8}
          style={styles.container1}>
          <Animated.View
            style={[styles.buttonContent, {transform: [{scale: scaleValue}]}]}>
            {selectedLanguageState || selectedLanguage ? (
              <>
                <Image
                  source={{
                    uri:
                      selectedLanguageState?.country_flag ||
                      'https://www.countryflags.com/wp-content/uploads/united-states-of-america-flag-png-large.png',
                  }}
                  style={styles.buttonFlag}
                />
                <Text style={styles.text}>
                  {selectedLanguageState?.country_code.toUpperCase() || code}
                </Text>
              </>
            ) : (
              <>
                <Icon
                  type={Icons.Ionicons}
                  color={'333366'}
                  name={'language'}
                />
                <Text style={styles.text}>Language</Text>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [{translateY: floatTranslateY}],
            },
          ]}>
          <Image
            source={{
              uri: 'https://i.ibb.co/7tc7dTW/next-static-media-about-us-8bf16a55.png',
            }}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {translate('welcomeMessage', {
              brandName: 'Villa Vote',
            })}
          </Text>
          <Text style={styles.subtitle}>{translate('discoverMessage')}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate('SignUpMethods')}>
            <Text style={styles.signUpButtonText}> {translate('signUp')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInButtonText}>{translate('signIn')}</Text>
          </TouchableOpacity>
        </View>

        {/* Language Modal */}
        <Modal
          visible={isLanguageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsLanguageModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.closeArea}
              onPress={() => setIsLanguageModalVisible(false)}
              activeOpacity={1}
            />
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{translateY: slideAnim}],
                },
              ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Language</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsLanguageModalVisible(false)}>
                  <Icon
                    type={Icons.Ionicons}
                    name="close"
                    size={24}
                    color="#000033"
                  />
                </TouchableOpacity>
              </View>

              <FlatList
                data={languageList}
                renderItem={renderLanguageItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginVertical: 30,
  },
  title: {
    fontSize: 30,
    fontFamily: FontFamily.bold,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: FontFamily.regular,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  signUpButton: {
    backgroundColor: '#000033',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000033',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButtonText: {
    color: '#000033',
    fontSize: 16,
    fontWeight: '600',
  },
  container1: {
    position: 'absolute',
    right: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 111,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  text: {
    fontSize: 16,
    color: '#19194D',
    fontWeight: '600',
  },
  selectedLanguageItem: {
    backgroundColor: '#F0F0F0',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  closeArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'absolute',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: '#000033',
    flex: 1,
    textAlign: 'center',
    // marginRight: 24,
  },
  closeButton: {
    position: 'absolute',
    right: 28,
  },
  listContent: {
    padding: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  flag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
    color: '#000033',
  },
  languageCode: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#666666',
    marginTop: 2,
  },
});
