import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    resendText: {
      fontSize: FontSize.F16,
      marginRight: 10,
      fontFamily: FontFamily.medium,
      color: BaseColors.primary,
    },
  });
};

export default GetStyles;
