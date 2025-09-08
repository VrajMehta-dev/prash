import { StyleSheet, Platform, StatusBar } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { FontFamily, FontSize } from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  const { colors } = useTheme();

  const BaseColors = {
    background: '#FFFFFF', // Always white background
    text: colors.text, // Use theme-based text color
    primary: colors.primary, // Keep primary theme color
    grey: '#E0E0E0', // Light grey for input background
  };

  const IOS = Platform.OS === 'ios';

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BaseColors.background,
      paddingHorizontal: 20,
      paddingTop: IOS ? 60 : StatusBar.currentHeight + 40,
    },
    mainContainer: {
      flex: 1,
      paddingBottom: 20,
    },
    codeInputFieldStyle: {
      width: 55,
      height: 55,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 60,
      fontFamily: FontFamily.medium,
      color: BaseColors.text, // Adapt to dark mode
      fontSize: FontSize.F18,
      padding: 0,
      margin: 0,
      paddingTop: 4,
      backgroundColor: BaseColors.grey, // Light grey for input background
    },
    timerContainer: {
      marginTop: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    resendText: {
      fontSize: FontSize.F16,
      color: BaseColors.primary, // Keep primary color for better visibility
    },
    title: {
      color: BaseColors.text, // Adapt text to dark mode
      textAlign: 'center',
      marginTop: 20,
      fontSize: FontSize.F32,
      marginBottom: 10,
      fontFamily: FontFamily.bold,
    },
  });
};

export default GetStyles;
