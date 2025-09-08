import {StyleSheet, Platform} from 'react-native';
import {FontFamily, FontSize} from '@config/theme';
import {useTheme} from '@react-navigation/native';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  const IOS = Platform.OS === 'ios';
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BaseColors.white,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: FontSize.F20,
      color: BaseColors.mainFontBlack,
      fontFamily: FontFamily.semiBold,
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
  });
};

export default GetStyles;
