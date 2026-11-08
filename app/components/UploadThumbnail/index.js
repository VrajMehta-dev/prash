import {translate} from '@lang/Translate';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const ThumbnailUpload = ({
  thumbnailImage,
  onUpload,
  onRemove,
  errorMessage,
  isGallery = false,
}) => {
  if (thumbnailImage && !isGallery) {
    return (
      <>
        <View style={styles.thumbnailContainer}>
          <Image
            source={{uri: thumbnailImage}}
            style={styles.thumbnailPreview}
          />
          <View style={styles.thumbnailOverlay}>
            <TouchableOpacity
              style={styles.changeThumbnailButton}
              onPress={onUpload}>
              <Icon name="camera" size={20} color="#fff" />
              <Text style={styles.changeThumbnailText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeThumbnailButton}
              onPress={onRemove}>
              <Icon name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </>
    );
  }

  return (
    <>
      <TouchableOpacity style={styles.thumbnailUploadButton} onPress={onUpload}>
        <View style={styles.uploadContent}>
          <Icon
            name={isGallery ? 'images-outline' : 'image-outline'}
            size={40}
            color="#6366F1"
          />
          <Text style={styles.uploadTitle}>
            {isGallery
              ? translate('upload') +
                ' ' +
                translate('gallery') +
                ' ' +
                translate('images')
              : translate('upload') + ' ' + translate('thumbnail')}
          </Text>
          <Text style={styles.uploadSubtitle}>{translate('tapCImage')}</Text>
        </View>
      </TouchableOpacity>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </>
  );
};

const styles = StyleSheet.create({
  thumbnailContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  thumbnailPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    marginBottom: 8,
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
    fontSize: 12,
    marginBottom: 8,
  },
});

export default ThumbnailUpload;
