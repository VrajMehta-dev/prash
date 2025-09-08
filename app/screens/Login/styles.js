import {StyleSheet, Platform, StatusBar} from 'react-native';
import {FontFamily, FontSize} from '@config/theme';
import {useTheme} from '@react-navigation/native';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;

  const IOS = Platform.OS === 'ios';

  // Define styles using the theme colors
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BaseColors.white,
      paddingHorizontal: 20,
      paddingTop: IOS ? 50 : StatusBar.currentHeight + 10,
    },
    mainContainer: {
      flex: 1,
      paddingBottom: 20,
    },
    imageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: IOS ? 80 : 40,
      paddingBottom: 20,
      paddingRight: 24,
    },
    title: {
      color: BaseColors.mainFontBlack,
      textAlign: 'center',
      marginTop: 20,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.F32,
      marginBottom: 10,
    },
    description: {
      color: BaseColors.thirdFontBlack,
      fontSize: FontSize.F18,
      textAlign: 'center',
      marginBottom: 30,
    },
    privacyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 10,
    },
    privacyText: {
      marginLeft: 10,
      fontSize: FontSize.F14,
      color: BaseColors.mainFontBlack,
      fontFamily: FontFamily.medium,
      textAlign: 'center',
    },
  });
};

export default GetStyles;
