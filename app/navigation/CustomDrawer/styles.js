import {StyleSheet, Platform, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  const IOS = Platform.OS === 'ios';
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: BaseColors.secondary,
      zIndex: -9999,

    },
    contentContainer: {
      paddingTop: 60,
      marginHorizontal: 30,
      maxWidth: 200,
    },
    root: {
      flex: 1,
      backgroundColor: BaseColors.white,
      overflow: 'hidden',
    },
    drawerTabText: bool => ({
      color: bool ? BaseColors.red : 'white',
      fontFamily: FontFamily.medium,
      fontSize: FontSize.F18,
      paddingTop: 14,
    }),
    drawerList: {
      marginTop: 10,
      height: Dimensions.get('screen').height / 1.8,
    },
    screenRoot: {
      backgroundColor: BaseColors.white,
      borderRadius: 20,
      flex: 1,
    },
    screenHeader: {
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    fullNameText: {
      color: 'white',
      fontFamily: FontFamily.medium,
      fontSize: FontSize.F24,
      marginTop: 10,
    },
    userNameText: {
      color: 'white',
      fontFamily: FontFamily.medium,
      fontSize: FontSize.F18,
    },
    versionContainer: {
      height: Dimensions.get('screen').height / 8,
      justifyContent: 'flex-end',
    },
    logoutContainer: {
      backgroundColor: BaseColors.primary,
      height: 35,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      width: '60%',
    },
    logout: {
      color: 'white',
      fontFamily: FontFamily.medium,
      fontSize: FontSize.F18,
    },
    versionText: {
      color: 'white',
      fontFamily: FontFamily.medium,
      fontSize: FontSize.F18,
    },
    tabBarContainer: {
      backgroundColor: BaseColors.whiteColor,
      bottom: 0,
      right: 0,
      left: 0,
    },
    title1: {
      color: '#000',
      fontSize: FontSize.F18,
      fontWeight: '600',
    },
    title2: {
      color: '#000',
      fontSize: FontSize.F18,
      fontWeight: '200',
    },
    backgroundStyle: {
      height: Dimensions.get('screen').height,
      width: Dimensions.get('screen').width,
    },
    gredientStyle: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    profileStyle: {
      height: 76,
      width: 76,
      borderRadius: 60,
      borderColor: 'white',
      borderWidth: 2,
    },
    textReturn: {
      color: 'white',
      fontFamily: FontFamily.medium,
      fontSize: FontSize.F16,
    },
    animatedStyle: {
      flexGrow: 1,
      position: 'absolute',
      backgroundColor: BaseColors.white,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    profileTextContainer: {
      flexDirection: 'row',
      paddingTop: 10,
      justifyContent: 'space-between',
      flex: 1,
    },
    popOver: {
      borderRadius: 10,
      flex: 1,
      padding: 8,
      backgroundColor: BaseColors.modalBackGround,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.4,
      shadowRadius: 4.0,
    },
    popOverText: {
      color: BaseColors.mainFontBlack,
      paddingLeft: 12,
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.F16,
    },
    profileImageAndCloseIconContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    drawerCloseIconBtn: {
      left: 30,
      alignItems: 'flex-end',
    },
  });
};
export default GetStyles;
