import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon, {Icons} from '@config/Icons';
import Toast from 'react-native-toast-message';
import {translate} from '@lang/Translate';

const {width} = Dimensions.get('window');

const UploadModal = ({
  visible,
  onClose,
  onFileSelect,
  title = 'Upload Document',
  subtitle = 'Choose how you want to upload your document',
}) => {
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

      onFileSelect(file);
      onClose();
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

      onFileSelect(file);
      onClose();
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

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });

      const file = result[0];
      onFileSelect(file);
      onClose();
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error picking document',
        });
      }
    }
  };

  const UploadOption = ({icon, title, description, onPress}) => (
    <TouchableOpacity style={styles.uploadCard} onPress={onPress}>
      <View style={styles.uploadIcon}>
        <Icon type={Icons.FontAwesome} name={icon} size={24} color="#1a237e" />
      </View>
      <Text style={styles.uploadTitle}>{translate(title)}</Text>
      <Text style={styles.uploadDescription}>{translate(description)}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSubtitle}>{subtitle}</Text>

          <UploadOption
            icon="camera"
            title="takePhoto"
            description="camDesc"
            onPress={handleImageFromCamera}
          />

          <UploadOption
            icon="image"
            title="chooseGallery"
            description="galleryDesc"
            onPress={handleImageFromGallery}
          />

          <UploadOption
            icon="file"
            title="browseDoc"
            description="docDesc"
            onPress={handleDocumentPick}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>{translate('Cancel')}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  uploadIcon: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7ff',
    borderRadius: 25,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default UploadModal;
