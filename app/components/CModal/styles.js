import {Platform, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  const IOS = Platform.OS === 'ios';
  return StyleSheet.create({
    backgroundContainer: {
      flex: 1,
      zIndex: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    absolute: {
      ...StyleSheet.absoluteFillObject,
    },
    blurView: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    modalMainView: {
      flex: 1,
      justifyContent: 'flex-end',
      zIndex: 10,
    },
    barStyle: {
      alignSelf: 'center',
      backgroundColor: BaseColors.thirdFontBlack,
      borderRadius: 8,
      width: 48,
      height: 3,
      marginTop: 10,
      marginBottom: 10,
    },
    modalView: {
      backgroundColor: BaseColors.modalBackGround,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.4,
      shadowRadius: 4.0,
      borderTopRightRadius: 28,
      borderTopLeftRadius: 28,
    },
    titleText: {
      color: BaseColors.mainFontBlack,
      textAlign: 'center',
      fontSize: FontSize.F24,
      fontFamily: FontFamily.bold,
      paddingVertical: 10,
      paddingBottom: IOS ? 15 : 10,
    },

    // warning Modal Styles
    warningModalContainer: {
      width: '85%',
      borderRadius: 16,
      backgroundColor: BaseColors.modalBackGround,
      elevation: 10,
      padding: 25,
    },
    waringHeaderTextContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
    },
    warningDescriptionTitleContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
    warningBtnContainer: {
      marginTop: 30,
      width: '100%',
    },

    //Confirmation Modal Styles
    confirmationModalContainer: {
      padding: 20,
    },
    confirmationModalBtnContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    confirmationModalBtn: {
      width: '48%',
    },
    modalHeaderText: {
      fontSize: FontSize.F24,
      fontFamily: FontFamily.bold,
      color: BaseColors.red,
      paddingBottom: IOS ? 15 : 10,
      textAlign: 'center',
    },
    confirmationDescriptionContainer: {
      marginVertical: 15,
    },
    modalDescriptionTxt: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.semiBold,
      color: BaseColors.secondFontBlack,
      width: '75%',
      textAlign: 'center',
      alignSelf: 'center',
    },

    modalMainContainer: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    modalTitle: {
      fontSize: FontSize.F22,
      fontFamily: FontFamily.medium,
      color: BaseColors.textColor,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
  });
};

export default GetStyles;
