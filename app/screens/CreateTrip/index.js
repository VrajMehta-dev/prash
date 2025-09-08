import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import CInput from '@components/CInput';
import CDateTimePicker from '@components/CDateTimePicker';
import ImagePicker from 'react-native-image-crop-picker';
import {LinearGradient} from 'react-native-linear-gradient';
import ThumbnailUpload from '@components/UploadThumbnail';
import Icon, {Icons} from '@config/Icons';
import Toast from 'react-native-toast-message';
import {getApiDataProgress} from '@utils/apiHelper';
import BaseSetting from '@config/setting';
import {translate} from '@lang/Translate';
import moment from 'moment';

const {width} = Dimensions.get('window');

const CreateTrip = ({navigation}) => {
  const [form, setForm] = useState({
    title: '',
    destination: '',
    thumbnailImage: null,
    checkInDate: '',
    checkOutDate: '',
    agentsCanJoin: '',
    budget: '',
    groupSize: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm(prev => ({...prev, [key]: value}));
    // Clear error when user starts typing
    setErrors(prev => ({...prev, [key]: ''}));

    // Special validation for dependent fields
    if (key === 'checkInDate' && form.checkOutDate) {
      validateDateRange(value, form.checkOutDate);
    }
    if (key === 'checkOutDate' && form.checkInDate) {
      validateDateRange(form.checkInDate, value);
    }
  };

  const validateDateRange = (checkIn, checkOut) => {
    if (checkIn && checkOut) {
      const startDate = moment(checkIn);
      const endDate = moment(checkOut);

      if (endDate.isSameOrBefore(startDate)) {
        setErrors(prev => ({
          ...prev,
          checkOutDate: translate('checkOutDateValidation'),
        }));
        return false;
      }
    }
    return true;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Required field validation
    const requiredFields = {
      title: 'title',
      destination: 'destination',
      thumbnailImage: 'destinationImage',
      checkInDate: 'checkInDate',
      checkOutDate: 'checkOutDate',
      agentsCanJoin: 'agentsCanJoin',
      budget: 'budget',
      groupSize: 'groupSize',
      description: 'description',
    };

    // Check required fields
    Object.entries(requiredFields).forEach(([key, translationKey]) => {
      if (!form[key]) {
        isValid = false;
        newErrors[key] = translate('simpValidation', {
          field: translate(translationKey),
        });
      }
    });

    // Numeric field validation
    const numericFields = ['agentsCanJoin', 'budget', 'groupSize'];
    numericFields.forEach(field => {
      if (form[field] && (isNaN(form[field]) || Number(form[field]) <= 0)) {
        isValid = false;
        newErrors[field] = translate('invalidNumber', {
          field: translate(field),
        });
      }
    });

    // Special validation for agents count
    if (
      form.agentsCanJoin &&
      !isNaN(form.agentsCanJoin) &&
      (Number(form.agentsCanJoin) > 10 || Number(form.agentsCanJoin) < 1)
    ) {
      isValid = false;
      newErrors.agentsCanJoin = 'Agents size out of range';
    }

    // Group size validation
    if (
      form.groupSize &&
      !isNaN(form.groupSize) &&
      (Number(form.groupSize) > 20 || Number(form.groupSize) < 2)
    ) {
      isValid = false;
      newErrors.groupSize = 'Group size out of range';
    }

    // Date range validation
    if (form.checkInDate && form.checkOutDate) {
      if (!validateDateRange(form.checkInDate, form.checkOutDate)) {
        isValid = false;
        // Error is already set in validateDateRange
      }
    }

    // Budget validation
    if (form.budget && !isNaN(form.budget)) {
      const budgetNum = Number(form.budget);
      if (budgetNum < 100 || budgetNum > 1000000) {
        isValid = false;
        newErrors.budget = 'Enter in Range Budget';
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = {
        'Trip[title]': form.title,
        'Trip[destination]': form.destination,
        'Trip[image]': form.thumbnailImage,
        'Trip[check_in_date]': form.checkInDate,
        'Trip[check_out_date]': form.checkOutDate,
        'Trip[agents_can_join]': form.agentsCanJoin,
        'Trip[budget]': form.budget,
        'Trip[group_size]': form.groupSize,
        'Trip[description]': form.description,
      };

      const result = await getApiDataProgress(
        BaseSetting.endpoints.createTrip,
        'POST',
        formData,
      );

      console.log('result', result);
      if (result?.status) {
        Toast.show({
          type: 'success',
          text1: translate('success'),
          text2: result?.message,
        });
        navigation.navigate('Profile');
      } else {
        throw new Error(result?.message);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: translate('error'),
        text2: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagePicker = () => {
    ImagePicker.openPicker({
      cropping: true,
      width: 1000,
      height: 800,
      compressImageQuality: 0.8,
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
        if (error.code !== 'E_PICKER_CANCELLED') {
          Toast.show({
            type: 'error',
            text1: translate('error'),
            text2: translate('imageUploadError'),
          });
        }
      });
  };

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Icon
          name={'arrow-back'}
          type={Icons.Ionicons}
          style={styles.backIcon}
          color={'#fff'}
        />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.headerGradient}>
          <Text style={styles.header}>{translate('createTrip')}</Text>
          <Text style={styles.subHeader}>{translate('shareJourney')}</Text>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.formDivider} />

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

          <Text style={styles.sectionTitle}>
            {translate('destinationImage')}
          </Text>
          <ThumbnailUpload
            thumbnailImage={form.thumbnailImage?.uri}
            onUpload={handleImagePicker}
            onRemove={() => handleChange('thumbnailImage', null)}
          />
          {errors.thumbnailImage && (
            <Text style={styles.errorText}>{errors.thumbnailImage}</Text>
          )}

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <CDateTimePicker
                placeholder={translate('checkInDate')}
                value={form.checkInDate}
                labelFormat="date"
                valueFormat="YYYY-MM-DD"
                onDateChange={value => handleChange('checkInDate', value)}
                errorMsg={errors.checkInDate}
                showError={errors.checkInDate}
                containerStyle={styles.input}
                minDate={new Date()}
              />
            </View>
            <View style={styles.inputContainer}>
              <CDateTimePicker
                placeholder={translate('checkOutDate')}
                value={form.checkOutDate}
                labelFormat="date"
                valueFormat="YYYY-MM-DD"
                onDateChange={value => handleChange('checkOutDate', value)}
                errorMsg={errors.checkOutDate}
                showError={errors.checkOutDate}
                containerStyle={styles.input}
                minDate={
                  form.checkInDate ? new Date(form.checkInDate) : new Date()
                }
              />
            </View>
          </View>

          <CInput
            placeholder={translate('agentsCanJoin')}
            value={form.agentsCanJoin}
            onChangeText={value => handleChange('agentsCanJoin', value)}
            showError={errors.agentsCanJoin}
            errorMsg={errors.agentsCanJoin}
            leftIcon="users"
            keyboardType="numeric"
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
            placeholder={translate('description')}
            value={form.description}
            onChangeText={value => handleChange('description', value)}
            showError={errors.description}
            errorMsg={errors.description}
            containerStyle={styles.input}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              style={styles.gradientButton}>
              <Text style={styles.submitButtonText}>
                {isSubmitting ? translate('creating') : translate('createTrip')}
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
  formDivider: {
    backgroundColor: '#8B5CF6',
    height: 6,
    width: 60,
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  backButton: {
    zIndex: 1,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 24,
    left: 15,
  },
  backIcon: {
    fontSize: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },

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

export default CreateTrip;
