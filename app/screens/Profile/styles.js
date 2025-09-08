import {StyleSheet, Platform, Dimensions, StatusBar} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const IOS = Platform.OS === 'ios';
const circleSize = Dimensions.get('screen').width * 1.55;
const GetStyles = () => {
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BaseColors.white,
    },
    coverImage: {
      width: Dimensions.get('screen').width,
      height: Dimensions.get('screen').height / 2.8,
    },
    userImage: {
      height: 100,
      width: 100,
      borderRadius: 50,
    },
    joinInText: {
      fontSize: FontSize.F16,
      fontFamily: FontFamily.semiBold,
      color: BaseColors.thirdFontBlack,
    },
    fullNameText: {
      fontSize: FontSize.F18,
      color: BaseColors.mainFontBlack,
      fontFamily: FontFamily.semiBold,
      paddingVertical: 5,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      color: BaseColors.mainFontBlack,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.F20,
      paddingBottom: 5,
    },
    description: {
      color: BaseColors.secondFontBlack,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.F18,
      lineHeight: 28,
    },
    editIcon: {
      width: 40,
      height: 40,
      backgroundColor: BaseColors.white,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
    },
    profilePicContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -110,
    },
    priProfileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    priProfileText: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.semiBold,
      color: BaseColors.secondFontBlack,
      marginRight: 5,
    },
    priProfileContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    switchContainer: {
      width: 50,
      height: 25,
      borderRadius: 15,
      backgroundColor: BaseColors.grey,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    onSwitch: {
      backgroundColor: BaseColors.primary,
      alignItems: 'flex-end',
    },
    switchCircle: {
      height: 18,
      width: 18,
      borderRadius: 9,
      backgroundColor: '#FFFFFF',
      margin: 5,
    },
    userNameContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    popOver: {
      borderRadius: 10,
      padding: 8,
      backgroundColor: BaseColors.modalBackGround,
      elevation: 4,
      width: Dimensions.get('screen').width / 1.1,
      shadowColor: '#000',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.4,
      shadowRadius: 4.0,
    },
    activePopOver: {
      right: 10,
    },
    priPopOver: {
      left: 10,
    },
    infoText: {
      color: BaseColors.thirdFontBlack,
      fontSize: FontSize.F14,
      fontFamily: FontFamily.regular,
    },
    deleteText: {
      color: BaseColors.red,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.F20,
      lineHeight: 32,
    },
    titleContainer: {
      paddingHorizontal: 20,
      marginBottom: 18,
    },
    switchTabContainer: {
      backgroundColor: BaseColors.grey,
      alignSelf: 'center',
      borderRadius: 10,
      marginTop: 20,
      marginBottom: 10,
    },
    preferenceItem: {
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: BaseColors.textColor,
      borderRadius: 50,
      marginHorizontal: 3,
    },
    preferenceText: {
      fontSize: FontSize.F14,
      fontFamily: FontFamily.bold,
      color: BaseColors.textColor,
    },
    contentConatinerPref: {
      flexDirection: 'row',
      paddingTop: 10,
      flexWrap: 'wrap',
    },
    borderRadiusStyle: {
      height: 150,
      width: '100%',
      marginTop: Dimensions.get('screen').height / 3.4,
      position: 'absolute',
    },
    headerContainer: {
      top: 75,
      right: 20,
      position: 'absolute',
      zIndex: 1,
      flexDirection: 'row',
    },
    visitPlaceImage: {
      height: 82,
      width: 82,
      borderRadius: 80,
      marginRight: 20,
    },
    header: {
      position: 'absolute',
      width: '100%',
      zIndex: 1,
      paddingVertical: 12,
      // marginTop: StatusBar.currentHeight,
      height: Dimensions.get('screen').height / 2.1,
      alignItems: 'stretch',
      justifyContent: 'flex-end',
      backgroundColor: BaseColors.white,
    },
    listEmptyComponent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    blockTitle: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.semiBold,
      color: BaseColors.secondFontBlack,
    },
    errorContainer: {
      backgroundColor: BaseColors.orange,
      padding: 8,
      marginBottom: 10,
      borderRadius: 6,
      flexDirection: 'row',
      marginHorizontal: 20,
    },
    errorText: {
      fontFamily: FontFamily.regular,
      textAlign: 'left',
      color: 'black',
      marginStart: 5,
      marginEnd: 24,
      fontSize: FontSize.F14,
    },
    errorIcon: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.bold,
      color: BaseColors.red,
    },
  });
};

export default GetStyles;
