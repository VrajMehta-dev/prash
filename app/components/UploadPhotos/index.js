/* eslint-disable react/no-unstable-nested-components */
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Linking,
  Alert,
  FlatList
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import DeviceInfo from 'react-native-device-info';
import _, {isEmpty} from 'lodash';
import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image';
import {useTheme} from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import CModal from '@components/CModal';
import CButton from '@components/CButton';
import {GetTypography} from '@config/theme';
import {CustomIcon} from '@config/LoadIcons';
import BaseSetting from '@config/setting';
import {Images} from '@config/images';
import Icon, {Icons} from '@config/Icons';
import {uploadOptions} from '@config/staticData';
import {getApiData, getApiDataProgress} from '@utils/apiHelper';
import {convertToBase64, getImageUrl} from '@utils/commonFunction';
import {translate} from '@lang/Translate';
import GetStyles from './styles';
import CErrorLog from '@components/CErrorLog';

const IOS = Platform.OS === 'ios';
const UploadPhotos = props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {
    value = [],
    onImageChange = () => {},
    
    maxLength = 3,
    multiple = false,
    attachFiles = false,
    chatUpload = false,
    showError = false,
    errorMsg = '',
    isSocial = false,
    data = null,
  } = props;
  console.log('data', data);
  console.log('isSocial', isSocial);

  const optionsArray = uploadOptions;

  const [uploadModal, setUploadModal] = useState(false);

  // permission for read media images
  const showEnablePermissionAlert = access => {
    Alert.alert('Oops!', `Please allow access to your ${access}`, [
      {
        text: 'Cancel',
        onPress: () => {
          console.log('Cancel Pressed');
        },
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]);
  };

  const openCamera = async index => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requesst(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'PHPL',
            message: 'PHPL needs access to your storage.',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use storage');
        } else {
          console.log('Storage permission denied');
        }
      } catch (err) {
        console.warn('Android lower Permission err', err);
      }
    }

    const readGranted = IOS
      ? true
      : await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);

    if (!readGranted) {
      showEnablePermissionAlert('camera to capture images.');
    } else {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
        mediaType: 'photo',
        forceJpg: IOS,
      })
        .then(async image => {
          setUploadModal(false);

          const singleImage = {
            isLocal: true,
            uri: image?.path,
            name: image?.path.substr(image?.path.lastIndexOf('/') + 1),
            type: image.mime,
          };
          const fileSizeInMB = image.fileSize / (1024 * 1024);
          if (fileSizeInMB > 10) {
            Toast.show({
              type: 'error',
              text2: 'File size exceeds 10MB. Please select a smaller file.',
            });
          } else {
            onImageChange(singleImage);
          }
        })
        .catch(err => {
          setUploadModal(false);
          console.log(`💥️ ~ openGallery ~ err ->`, err.message);
          if (err?.message?.startsWith('User cancelled')) {
          } else {
            setTimeout(() => {
              Toast.show({type: 'error', text2: err.message});
            }, 750);
          }
        });
    }
  };

  const openGallery = async index => {
    const androidVersion = DeviceInfo.getSystemVersion();
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          androidVersion >= 13
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'PHPL',
            message: 'PHPL needs access to your storage.',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use storage');
        } else {
          console.log('Storage permission denied');
        }
      } catch (err) {
        console.warn('Android lower Permission err', err);
      }
    }

    const readGranted = IOS
      ? true
      : await PermissionsAndroid.check(
          androidVersion >= 13
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );

    if (!readGranted) {
      showEnablePermissionAlert('photo to select images.');
    } else {
      ImagePicker.openPicker({
        width: 200,
        height: 200,
        mediaType: 'photo',
        forceJpg: IOS,
      })
        .then(async image => {
          setUploadModal(false);

          const singleImage = {
            isLocal: true,
            uri: image?.path,
            name: image?.path.substr(image?.path.lastIndexOf('/') + 1),
            type: image.mime,
          };
          const fileSizeInMB = image.fileSize / (1024 * 1024);
          if (fileSizeInMB > 10) {
            Toast.show({
              type: 'error',
              text2: 'File size exceeds 10MB. Please select a smaller file.',
            });
          } else {
            onImageChange(singleImage);
          }
        })
        .catch(err => {
          setUploadModal(false);
          console.log(`💥️ ~ openGallery ~ err ->`, err.message);
          if (err?.message?.startsWith('User cancelled')) {
          } else {
            setTimeout(() => {
              Toast.show({type: 'error', text2: err.message});
            }, 750);
          }
        });
    }
  };

  return (
    <View>
      <View style={styles.profileImageContainer}>
        <View style={{position: 'relative'}}>
          {isSocial && !isEmpty(data) ? (
            <FastImage
              style={{height: 120, width: 120, borderRadius: 60}}
              resizeMode={FastImage.resizeMode.cover}
              source={{uri: data}}
            />
          ) : (
            <FastImage
              source={
                _.isString(value) && !_.isEmpty(value)
                  ? {
                      uri: getImageUrl(value, 'small'),
                    }
                  : value?.isLocal
                  ? value
                  : Images?.Avatar
              }
              style={{height: 120, width: 120, borderRadius: 60}}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}

          <TouchableOpacity
            style={styles.profileImageUploadBtn}
            activeOpacity={0.6}
            onPress={() => {
              setUploadModal(true);
            }}>
            <Icon
              type={Icons.Ionicons}
              name={!isEmpty(value) ? 'close' : 'camera-outline'}
              size={20}
              color={BaseColors.primary}
            />
          </TouchableOpacity>
        </View>
        {showError ? (
          <CErrorLog style={{marginVertical: 5}} msg={errorMsg} />
        ) : null}
      </View>

      <CModal
        visible={uploadModal}
        onRequestClose={() => {
          setUploadModal(false);
        }}
        childrenViewStyle={styles.uploadModal}>
        <FlatList
          data={optionsArray}
          renderItem={({item, index}) => {
            const isLast = index == optionsArray?.length - 1;
            return (
              <TouchableOpacity
                key={`options_${item.id}_${index}`}
                activeOpacity={0.7}
                onPress={() => {
                  if (item?.id == 1) {
                    openCamera();
                  } else if (item?.id == 2) {
                    openGallery();
                  }
                }}
                style={[
                  styles.uploadModalIconAndTextContainer,
                  isLast && {borderBottomWidth: 0},
                ]}>
                <Icon
                  type={Icons.Ionicons}
                  name={item.icon}
                  style={styles.uploadModalIcon}
                />
                <Text style={styles.uploadModalTitleText}>
                  {translate(item.title)}
                </Text>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item?.id}
          ListFooterComponent={() => {
            return (
              <CButton
                whiteBgBtn
                label={translate('Cancel')}
                onPress={() => {
                  setUploadModal(false);
                }}
              />
            );
          }}
        />
      </CModal>
    </View>
  );
};

export default UploadPhotos;
