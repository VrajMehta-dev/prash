import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import CInput from '@components/CInput';
import CDateTimePicker from '@components/CDateTimePicker';
import ImagePicker from 'react-native-image-crop-picker'; // Install via `npm install react-native-image-crop-picker`
import {LinearGradient} from 'react-native-linear-gradient';
import ThumbnailUpload from '@components/UploadThumbnail';
import _ from 'lodash';
import Icon, {Icons} from '@config/Icons';
import Toast from 'react-native-toast-message';
import {getApiDataProgress} from '@utils/apiHelper';
import BaseSetting from '@config/setting';
import {translate} from '@lang/Translate';
const {width} = Dimensions.get('window');
const CreatePost = ({navigation}) => {
  const [form, setForm] = useState({
    title: '',
    destination: '',
    thumbnailImage: null,
    travelDate: '',
    budget: '',
    groupSize: '',
    description: '',
    postVisibility: 'Public',
    isPublished: '0',
    galleryImages: [],
  });

  const [errors, setErrors] = useState({});
  const [nextBtnLoader, setNextBtnLoader] = useState(false);

  const handleChange = (key, value) => {
    setForm({...form, [key]: value});
    setErrors({...errors, [key]: ''});
  };
  const CreatePostForm = async () => {
    try {
      setNextBtnLoader(true);
      const formData = {
        'TravelPosts[title]': form.title,
        'TravelPosts[destination]': form.destination,
        'TravelPosts[thumbnail_image]': form.thumbnailImage,
        'TravelPosts[travel_date]': form.travelDate,
        'TravelPosts[budget]': form.budget,
        'TravelPosts[group_size]': form.groupSize,
        'TravelPosts[description]': form.description,
        'TravelPosts[post_visibility]': form.postVisibility,
        'TravelPosts[gallery_images]': form.galleryImages,
      };

      const result = await getApiDataProgress(
        BaseSetting.endpoints.createPost,
        'post',
        formData,
      );
      if (result?.status) {
        navigation.navigate('Profile');
        Toast.show({
          type: 'success',
          text1: 'Hurrah!',
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message,
      });
    } finally {
      setNextBtnLoader(false);
    }
  };
  const validateForm = () => {
    let valid = true;
    let tempErrors = {};

    if (!form.title) {
      valid = false;
      tempErrors.title = translate('simpValidation', {
        field: translate('title'),
      });
    }

    if (!form.destination) {
      valid = false;
      tempErrors.destination = tempErrors.destination = translate(
        'simpValidation',
        {
          field: translate('destination'),
        },
      );
    }

    if (!form.thumbnailImage) {
      valid = false;
      tempErrors.thumbnailImage = translate('simpValidation', {
        field: translate('thumbnail') + ' ' + translate('images'),
      });
    }

    if (!form.travelDate) {
      valid = false;
      tempErrors.travelDate = translate('simpValidation', {
        field: translate('travelDate'),
      });
    }

    if (!form.budget || isNaN(form.budget)) {
      valid = false;
      tempErrors.budget = translate('simpValidation', {
        field: 'valid ' + translate('budget'),
      });
    }

    if (!form.groupSize || isNaN(form.groupSize)) {
      valid = false;
      tempErrors.groupSize = translate('simpValidation', {
        field: 'valid ' + translate('groupSize'),
      });
    }

    if (!form.description) {
      valid = false;
      tempErrors.description = translate('simpValidation', {
        field: translate('description'),
      });
    }

    if (form.galleryImages.length === 0) {
      valid = false;
      tempErrors.galleryImages = 'At least 1 image is required';
    }

    if (form.galleryImages.length > 5) {
      valid = false;
      tempErrors.galleryImages = 'You can select a maximum of 5 images';
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleImagePicker = () => {
    ImagePicker.openPicker({
      cropping: true,
    })
      .then(image => {
        setForm(prev => ({
          ...prev,
          thumbnailImage: {
            uri: image?.path,
            name: image?.path.substr(image?.path.lastIndexOf('/') + 1),
            type: image.mime,
          },
        }));
        setErrors(prev => ({...prev, thumbnailImage: ''}));
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleGalleryPicker = () => {
    ImagePicker.openPicker({
      multiple: true,
      cropping: true,
    })
      .then(images => {
        console.log('images', images);
        const newImages = images.map(image => ({
          uri: image?.path,
          name: image?.path.substr(image?.path.lastIndexOf('/') + 1),
          type: image.mime,
        }));
        console.log('newImages', newImages);

        if (form.galleryImages.length + newImages.length > 5) {
          setErrors({galleryImages: 'You can select a maximum of 5 images'});
          return;
        }

        handleChange('galleryImages', [...form.galleryImages, ...newImages]);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleRemoveImage = index => {
    const updatedImages = [...form.galleryImages];
    updatedImages.splice(index, 1);
    handleChange('galleryImages', updatedImages);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      CreatePostForm();
      // Alert.alert('Form Submitted', JSON.stringify(form, null, 2));
    } else {
      // Alert.alert('Form has errors', 'Please fix them before submitting');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={{zIndex: 1, position: 'absolute'}}>
        <Icon
          name={'arrow-back'}
          type={Icons.Ionicons}
          style={{top: 68, left: 15}}
          color={'#fff'}
        />
      </TouchableOpacity>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.headerGradient}>
          <Text style={styles.header}>{translate('createTravelPost')}</Text>
          <Text style={styles.subHeader}>{translate('shareJourney')}</Text>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.formContainer}>
          <View
            style={{
              backgroundColor: '#8B5CF6',
              height: 6,
              width: 60,
              alignSelf: 'center',
              borderRadius: 10,
              marginBottom: 20,
            }}
          />
          <CInput
            placeholder={translate('title')}
            value={form.title}
            onChangeText={value => handleChange('title', value)}
            showError={errors.title}
            errorMsg={errors.title}
            containerStyle={styles.input}
            leftIcon="edit"
          />

          <CInput
            placeholder={translate('destination')}
            value={form.destination}
            onChangeText={value => handleChange('destination', value)}
            showError={errors.destination}
            errorMsg={errors.destination}
            containerStyle={styles.input}
            leftIcon="map-pin"
          />

          <Text style={styles.sectionTitle}>{translate('thumbnailImage')}</Text>
          <ThumbnailUpload
            thumbnailImage={form.thumbnailImage?.uri}
            onUpload={handleImagePicker}
            onRemove={() => setForm(prev => ({...prev, thumbnailImage: ''}))}
          />
          {errors.thumbnailImage && (
            <Text style={styles.errorText}>{errors.thumbnailImage}</Text>
          )}

          <CDateTimePicker
            placeholder={translate('travelDate')}
            value={form.travelDate}
            labelFormat="date"
            valueFormat="YYYY-MM-DD"
            onDateChange={value => handleChange('travelDate', value)}
            errorMsg={errors.travelDate}
            showError={errors.travelDate}
            containerStyle={styles.input}
          />

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <CInput
                placeholder={translate('budget')}
                value={form.budget}
                onChangeText={value => handleChange('budget', value)}
                showError={errors.budget}
                errorMsg={errors.budget}
                leftIcon="dollar-sign"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <CInput
                placeholder={translate('groupSize')}
                value={form.groupSize}
                onChangeText={value => handleChange('groupSize', value)}
                showError={errors.groupSize}
                errorMsg={errors.groupSize}
                leftIcon="users"
                keyboardType="numeric"
              />
            </View>
          </View>
          <Text style={styles.sectionTitle}>{translate('description')}</Text>

          <CInput
            placeholder={translate('enterField', {
              fieldName: translate('description'),
            })}
            value={form.description}
            onChangeText={value => handleChange('description', value)}
            showError={errors.description}
            errorMsg={errors.description}
            containerStyle={styles.input}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.sectionTitle}>{translate('postVisibility')}</Text>
          <View style={styles.visibilityOptions}>
            {[
              translate('public'),
              translate('private'),
              translate('friendsOnly'),
            ].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.visibilityOption,
                  form.postVisibility === option && styles.selectedOption,
                ]}
                onPress={() => handleChange('postVisibility', option)}>
                <Text
                  style={[
                    styles.visibilityText,
                    form.postVisibility === option &&
                      styles.selectedVisibilityText,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>
            {translate('upload')} {translate('gallery')} {translate('images')}
          </Text>

          {_.isEmpty(form.galleryImages) && (
            <ThumbnailUpload
              thumbnailImage={form.thumbnailImage}
              onUpload={handleGalleryPicker}
              isGallery={true}
            />
          )}

          {errors.galleryImages && (
            <Text style={styles.errorText}>{errors.galleryImages}</Text>
          )}
          <View style={styles.imageGrid}>
            {form.galleryImages.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{uri: image?.uri}} style={styles.galleryImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}>
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              style={styles.gradientButton}>
              <Text style={styles.submitButtonText}>
                {translate('createPost')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
    backgroundColor: '#895cf5',
    height: '100%',
    width: '100%',
  },
  headerGradient: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flexGrow: 1,
  },
  formContainer: {
    marginTop: Platform.OS === 'ios' ? 160 : 104,
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  input: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputContainer: {
    width: '48%',
  },
  // sectionTitle: {
  //   fontSize: 18,
  //   fontWeight: '600',
  //   color: '#374151',
  //   marginVertical: 12,
  // },
  imagePickerButton: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  visibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  visibilityOption: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#818CF8',
  },
  visibilityText: {
    fontSize: 14,
    color: '#4B5563',
  },
  selectedVisibilityText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  imageWrapper: {
    width: (width - 48) / 3,
    aspectRatio: 1,
    padding: 4,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  thumbnailContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  thumbnailPreview: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  changeThumbnailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeThumbnailText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  removeThumbnailButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    padding: 8,
    borderRadius: 8,
  },
  thumbnailUploadButton: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
    overflow: 'hidden',
  },
  uploadContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 16,
  },
});

export default CreatePost;
