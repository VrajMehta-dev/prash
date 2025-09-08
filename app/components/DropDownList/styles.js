import {StyleSheet, Platform} from 'react-native';
import {FontFamily, FontSize} from '@config/theme';
import {useTheme} from '@react-navigation/native';
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  const IOS = Platform.OS === 'ios';
  return StyleSheet.create({
    container: {
      marginBottom: 15,

      flex: 1,
    },
    requiredIcon: {
      fontSize: FontSize.F8,
      color: BaseColors.red,
      marginLeft: 2,
    },
    dropdown: error => ({
      height: 50,
      borderRadius: 10,
      backgroundColor: '#fff',
      color: '#333', // Darker text color
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3, // Shadow for Android
      // paddingHorizontal: 15,
      borderWidth: 1,
      justifyContent: 'center',
      borderColor: error ? BaseColors.errorColor : BaseColors.borderColor,
    }),
    dropdownItem: {
      paddingVertical: 10,
      backgroundColor: BaseColors.white,
    },
    dropdownItemText: selected => ({
      color: selected ? BaseColors.primary : BaseColors.thirdFontBlack,
      fontFamily: FontFamily.regular,
      paddingLeft: 20,
    }),
    placeholderStyle: {
      color: BaseColors.thirdFontBlack,
      paddingLeft: 18,
      fontFamily: FontFamily.regular,
    },
    selectedTextStyle: {
      paddingLeft: 20,
      color: BaseColors.textColor,
      // fontFamily: FontFamily.regular,
    },
    iconStyle: {
      width: 20,
      height: 20,
      marginRight: 15,
    },
    inputSearchStyle: {
      borderRadius: 4,
      height: 40,
      color: BaseColors.textColor,
      lineHeight: 20,
      padding: 0,
      fontFamily: FontFamily.regular,
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    label: {
      marginBottom: 10,
    },
    listContainer: {
      backgroundColor: BaseColors.white,
      borderRadius: 6,
      borderWidth: 0,
    },
    listText: {
      color: BaseColors.mainFontBlack,
      fontFamily: FontFamily?.regular,
      fontSize: FontSize.F16,
    },

    selectedStyle: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 3,
      backgroundColor: 'white',
      marginTop: 8,
      marginRight: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: BaseColors.borderColor,
    },
    textSelectedStyle: {
      marginRight: 5,
      fontSize: FontSize.F16,
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
