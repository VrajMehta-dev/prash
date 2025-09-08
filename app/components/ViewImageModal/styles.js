import {BaseColors} from '@config/theme';
import {Platform, StyleSheet} from 'react-native';

const IOS = Platform.OS === 'ios';

export default StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: BaseColors.black,
    paddingTop: 20,
    width: '100%',
    maxHeight: '100%',
    height: '100%',
  },
  lottieView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
  },
  marT: {
    marginTop: 20,
  },
  supportTxt: {
    textAlign: 'center',
    color: BaseColors.textSecondary,
    paddingTop: 20,
  },
  supportTxt2: {
    textAlign: 'center',
    color: BaseColors.textSecondary,
  },
  renderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  padL10: {
    paddingLeft: 10,
  },
  lastSeenTxt: {
    paddingLeft: 10,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
  },
  searchIcon: {
    paddingVertical: 14,
    paddingRight: 10,
    paddingHorizontal: 10,
  },
  input: {
    width: '75%',
    paddingRight: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    color: '#424242',
    paddingVertical: IOS ? 15 : 0,
  },
  checkIcon: {
    color: BaseColors.primary,
    fontSize: 20,
  },
});
