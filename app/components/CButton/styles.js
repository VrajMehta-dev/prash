import {StyleSheet, Platform, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;

  const IOS = Platform.OS === 'ios';

  // Define styles using the theme colors
  return StyleSheet.create({
    container: {
      overflow: 'hidden',
      height: 58,
      width: '100%',
      // borderRadius: 30,
    },
    fillBtn: {
      overflow: 'hidden',
      height: 50,
      backgroundColor: BaseColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      // borderRadius: 30,
    },
    gradientContainer: {},
    fillBtnContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    outLineBtnContainer: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: BaseColors.primary,
      borderRadius: 30,
    },
    whiteBtnContainer: {
      height: 58,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 30,
      backgroundColor: BaseColors.primaryLight,
    },
    linkBtnContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 30,
    },
    linkBtnText: {
      color: BaseColors.primary,
      fontFamily: FontFamily.bold,
      textDecorationLine: 'underline',
    },
    loginBtnContainer: {
      borderWidth: 1,
      borderRadius: 25,
      borderColor: BaseColors.borderColor,
      padding: 15,
      marginVertical: 10,
    },
    logoAndLabelContainer: {
      flexDirection: 'row',
    },
    loginBtnLabelText: {
      color: BaseColors.textColor,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.F16,
    },
    iconContainer: {
      width: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    whiteBtnIcon: {
      fontSize: 20,
      color: BaseColors.primary,
      marginRight: 4,
      marginTop: 3,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textBtnText: {
      color: BaseColors.primary,
      fontSize: FontSize.F16,
      fontFamily: FontFamily.bold,
    },
    secondaryBtn: (bool = false) => [
      {
        backgroundColor: BaseColors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 5,
      },
      bool && {flexDirection: 'row', justifyContent: 'space-between'},
    ],
    secondaryText: {
      fontSize: FontSize.F16,
      fontFamily: FontFamily.medium,
      color: BaseColors.buttonLabel,
      textAlign: 'center',
    },
    secondaryArrowIcon: {
      fontSize: 18,
      color: 'white',
      transform: [{rotate: '180deg'}],
    },

    // Surprise Me Btn
    surpriseMeContainer: loading => ({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: loading ? BaseColors.grey : BaseColors.secondary,
      borderRadius: 8,
      padding: 12,
    }),
    surpriseContainer: {
      paddingHorizontal: 5,
      marginLeft: 10,
      flex: 1,
    },
    surpriseText: {
      fontSize: FontSize.F18,
      color: 'white',
      fontFamily: FontFamily.bold,
      lineHeight: 28,
    },
    surpriseDescription: {
      fontSize: FontSize.F12,
      color: 'white',
      fontFamily: FontFamily.semiBold,
      lineHeight: 20,
    },
    rightArrowIcon: {
      fontSize: 22,
      color: 'white',
      transform: [
        {
          rotate: '180deg',
        },
      ],
    },
    surpriseMeLoader: {
      position: 'relative',
      height: Dimensions.get('screen').height / 5,
    },
    loaderContainer: {
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loaderText: {
      color: BaseColors.mainFontBlack,
      fontSize: FontSize.F20,
      fontFamily: FontFamily.semiBold,
      lineHeight: 32,
      marginTop: 20,
    },
    loaderMessage: {
      color: BaseColors.thirdFontBlack,
      fontSize: FontSize.F12,
      lineHeight: 22,
      fontFamily: FontFamily.regular,
      textAlign: 'center',
      paddingHorizontal: 10,
    },
  });
};

export default GetStyles;
