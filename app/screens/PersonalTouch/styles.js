import {StyleSheet, Platform} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

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
    mainContainer: {
      flex: 1,
    },
    infoText: {
      color: BaseColors.thirdFontBlack,
      lineHeight: 22.4,
      fontSize: FontSize.F14,
    },
    title: {
      color: BaseColors.mainFontBlack,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.F32,
      marginBottom: 15,
      marginTop: 30,
    },
    description: {
      color: BaseColors.thirdFontBlack,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.F18,
      lineHeight: 28,
    },
  });
};
export default GetStyles;
