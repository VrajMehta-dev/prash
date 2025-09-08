import {StyleSheet} from 'react-native';
import {FontFamily, FontSize} from '@config/theme';
import {useTheme} from '@react-navigation/native';
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
    },
    labelText: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.semiBold,
      color: BaseColors.mainFontBlack,
      marginLeft: 10,
    },
    errorContainer: {
      backgroundColor: 'rgba(254, 51, 35, 0.1)',
      padding: 8,
      marginTop: 5,
      borderRadius: 6,
      flexDirection: 'row',
    },
    errorText: {
      fontFamily: FontFamily.regular,
      textAlign: 'left',
      color: '#F75555',
      marginStart: 5,
      marginEnd: 24,
      fontSize: FontSize.F14,
    },
    errorIcon: {
      fontSize: FontSize.F18,
      color: BaseColors.red,
    },
  });
};
export default GetStyles;
