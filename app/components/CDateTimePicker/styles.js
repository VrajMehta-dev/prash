import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    root: {
      marginBottom: 15,
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    label: {
      marginBottom: 10,
    },
    inputWrapper: error => ({
      height: 50,
      justifyContent: 'center',
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
      borderWidth: 1,
      borderColor: error ? BaseColors.errorColor : BaseColors.borderColor,
    }),
    placeholder: {
      fontFamily: FontFamily.regular,
      color: BaseColors.placeholder,
    },
    disabled: {
      opacity: 0.7,
      backgroundColor: BaseColors.grey20,
    },
    iconBox: {},
    warningIcon: {
      fontSize: 18,
      color: BaseColors.red,
      right: 0,
      marginRight: 5,
    },
    calenderIcon: {
      fontSize: 18,
      color: BaseColors.mainFontBlack,
    },
    requiredIcon: {
      fontSize: FontSize.F8,
      color: BaseColors.red,
      marginLeft: 2,
    },
    errorContainer: {
      backgroundColor: 'rgba(254, 51, 35, 0.1)',
      padding: 8,
      marginTop: 5,
      borderRadius: 6,
      flexDirection: 'row',
      // justifyContent: 'space-between',
    },
    errorText: {
      fontFamily: FontFamily.regular,
      textAlign: 'left',
      color: '#F75555',
      marginStart: 5,
      marginEnd: 24,
      fontSize: FontSize.F14,
    },
  });
};
export default GetStyles;
