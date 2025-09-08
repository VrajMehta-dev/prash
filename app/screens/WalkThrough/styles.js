import {Dimensions, StyleSheet, Platform, StatusBar} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const IOS = Platform.OS === 'ios';
const GetStyles = () => {
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BaseColors.white,
      paddingTop: IOS ? 30 : 0,
    },
    statusBarContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      // marginTop: StatusBar.currentHeight + 20,
    },
    skipBtnContainer: {
      position: 'absolute',
      right: 10,
      top: IOS ? 50 : StatusBar.currentHeight + 20,
      zIndex: 1,
      flexDirection: 'row',
    },
    skipText: {
      fontSize: FontSize.F14,
      fontFamily: FontFamily.regular,
      color: BaseColors.white,
    },
    renderItemContainer: {
      width: Dimensions.get('screen').width,
      paddingHorizontal: 20,
      paddingBottom: 20,
      justifyContent: 'flex-end',
      flex: 1,
    },
    image: {
      width: '90%',
      height: '80%',
      resizeMode: 'contain',
    },
    textContainer: {},
    titleText: {
      color: 'black',
      fontSize: FontSize.F32,
      paddingBottom: 10,
      fontFamily: FontFamily.bold,
      textAlign: 'center',
    },
    descriptionText: {
      color: 'black',
      fontSize: FontSize.F18,
      fontFamily: FontFamily.regular,
      textAlign: 'center',
    },
    threeDots: {
      margin: 4,
      borderRadius: 5,
      height: 8,
    },
    svgContainer: {
      width: '100%',
      height: '80%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backgroundVideo: {
      // ...StyleSheet.absoluteFillObject,
      position: 'absolute',
      top: IOS ? -30 : 0,
      height: IOS
        ? Dimensions.get('screen').height + 50
        : Dimensions.get('screen').height,
      width: '100%',
    },
    absolute: {
      ...StyleSheet.absoluteFillObject,
    },
    btnContainer: {flexDirection: 'row', justifyContent: 'space-between'},
    btn: {width: '48.5%'},
  });
};

export default GetStyles;
