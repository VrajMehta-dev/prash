import {StyleSheet, Platform} from 'react-native';
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
    inputWrapper: error => ({
      // height: 50,
      borderRadius: 10, // Rounded corners
      backgroundColor: '#fff', // White background
      paddingStart: 15,
      fontSize: 16,
      color: '#333', // Darker text color
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3, //
      borderWidth:1,
      borderColor: error ? BaseColors.errorColor : BaseColors.borderColor,
    }),
    requiredIcon: {
      color: BaseColors.red,
      marginLeft: 0,
      fontSize: FontSize.F8,
    },
    input: {
      flex: 1,
      paddingVertical: 0,
      fontSize:16,
      marginEnd: 24,
    },
    labelMainContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
    },
    labelText: {
      marginBottom: 10,
    },
    infoIcon: {
      marginBottom: 4,
      color: BaseColors.thirdFontBlack,
      fontSize: 22,
    },
    infoLabelText: {
      fontSize: FontSize.F16,
      fontFamily: FontFamily.regular,
      color: BaseColors.mainFontBlack,
    },
    leftIcon: {
      marginRight: 10,
      marginLeft: 5,
    },
    countryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    countryDownIcon: {
      fontSize: 18,
      color: BaseColors.mainFontBlack,
      marginHorizontal: 5,
    },
    countryPickerView: {
      flexDirection: 'row',
      marginLeft: 3,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderRightColor: BaseColors.borderColor,
    },
    codeTextStyle: {
      backgroundColor: BaseColors.alertRed,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.F14,
      color: BaseColors.black,
      paddingBottom: IOS ? 10 : 0,
    },
    conditionsContainer: {
      marginTop: 6,
    },
    conditionText: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.F12,
      color: BaseColors.alertRed,
      marginBottom: 5,
    },
    green: {
      color: BaseColors.green,
    },
    errorContainer: {
      backgroundColor: 'rgba(254, 51, 35, 0.1)',
      padding: 8,
      marginTop: 5,
      borderRadius: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    leftErrorContainer: {
      flexDirection: 'row',
      flex: 1,
    },
    errorText: {
      fontFamily: FontFamily.medium,
      textAlign: 'left',
      color: BaseColors.error,
      marginStart: 5,
      marginEnd: 24,
      fontSize: FontSize.F14,
      flex: 1,
    },
    rightErrorText: {
      fontFamily: FontFamily.semiBold,
      color: '#F75555',
      fontSize: FontSize.F14,
      textDecorationLine: 'underline',
    },
    phoneCodeText: notEmpty => ({
      fontSize: FontSize.F18,
      fontFamily: notEmpty ? FontFamily.semiBold : FontFamily.regular,
      color: notEmpty ? BaseColors.textColor : BaseColors.placeholder,
      marginLeft: 5,
    }),
    dollarCont: {
      height: '100%',
      backgroundColor: BaseColors.border,
      width: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      marginLeft: -13,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    dollarText: {
      color: BaseColors.mainFontBlack,
      fontSize: FontSize.F18,
      fontFamily: FontFamily.bold,
    },
    popOver: {
      borderRadius: 5,
      padding: 5,
      backgroundColor: BaseColors.modalBackGround,
      marginBottom: 30,
      elevation: 8,
      top: 0,
      right: 10,
      position: 'absolute',
    },
  });
};

export default GetStyles;
