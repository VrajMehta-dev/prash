import {StyleSheet} from 'react-native';
import {FontFamily, FontSize} from '@config/theme';
import {useTheme} from '@react-navigation/native';
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    errorContainer: {
    },
    errorText: {
      fontFamily: FontFamily.regular,
      lineHeight: 18,
      fontSize: 12,
    },
    errorIcon: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.bold,
      color: BaseColors.red,
    },
  });
};
export default GetStyles;
