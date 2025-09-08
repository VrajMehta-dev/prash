import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    mainFilterInputContainer: {
      borderRadius: 10,
      height: 58,
      flexDirection: 'row',
      marginVertical: 10,
      justifyContent: 'space-between',
      backgroundColor: BaseColors.inputBackGround,
    },
    inputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 5,
    },
    searchIcon: {
      fontSize: FontSize.F18,
      color: BaseColors.textColor,
      marginLeft: 15,
      marginRight: 5,
    },
    searchInput: {
      flex: 1,
      padding: 0,
    },
    clearSearchContainer: {
      marginHorizontal: 5,
    },
    closeIcon: {
      fontSize: FontSize.F22,
      color: BaseColors.textColor,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationIcon: {
      fontSize: 20,
      color: BaseColors.mainFontBlack,
      marginRight: 10,
    },
    locationText: {
      fontSize: 16,
      fontFamily: FontFamily.medium,
      color: BaseColors.mainFontBlack,
      paddingRight: 50,
      textDecorationLine: 'underline',
    },
    editIcon: {
      fontSize: 18,
      color: BaseColors.mainFontBlack,
    },
    gpsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    gpsIcon: {
      fontSize: 16,
      color: BaseColors.primary,
      marginRight: 10,
      marginLeft: 2,
    },
    gpsText: {
      fontSize: FontSize.F16,
      fontFamily: FontFamily.medium,
      color: BaseColors.primary,
      textDecorationLine: 'underline',
    },
  });
};
export default GetStyles;
