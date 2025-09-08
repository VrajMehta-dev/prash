import {BaseColors} from '@config/theme';
import {Platform, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    justifyContent: 'center',
  },
  headerName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    color: '#E5E7EB',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 20,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  messagesContainer: {
    backgroundColor: 'white',
    paddingTop: 12,
  },
  inputToolbar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    color: '#374151',
    fontSize: 16,
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 120,
  },
  sendContainer: {
    marginRight: 8,
    marginBottom: 8,
  },
  sendIcon: {
    marginRight: 4,
  },

  //
  container1: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    padding: 8,
    color: '#374151',
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  sendButtonActive: {
    backgroundColor: '#7C3AED',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  popoverContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionWrapper: {
    alignItems: 'center',
    width: '30%',
    marginVertical: 12,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151',
  },
  //
  imageBubble: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 5,
  },
  leftBubble: {
    alignSelf: 'flex-start',
  },
  rightBubble: {
    alignSelf: 'flex-end',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 111,
  },
  rightContainer: {
    backgroundColor: BaseColors.primaryLight,
    alignSelf: 'flex-end',
    padding: 10,
    minWidth: 150,
  },
  leftContainer: {
    backgroundColor: '#E4E6EB',
    padding: 10,
    minWidth: 150,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  rightPlayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  leftPlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressContainer: {
    flex: 1,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  rightProgressBar: {
    backgroundColor: '#FFFFFF',
  },
  leftProgressBar: {
    backgroundColor: '#000000',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginBottom: 4,
    overflow: 'hidden',
  },
  waveformBar: {
    width: 2,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  rightWaveformBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  leftWaveformBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  audioBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    maxWidth: 250,
  },
  duration: {
    fontSize: 12,
  },
  rightText: {
    color: '#FFFFFF',
  },
  leftText: {
    color: '#000000',
  },
  playText: {
    fontSize: 16,
    color: 'white',
  },

  slider: {
    flex: 1,
    height: 30,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 10,
  },
  retryContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  container2: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    maxWidth: '80%',
    marginVertical: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  recordButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },

  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 10,
  },

});

export default styles;
