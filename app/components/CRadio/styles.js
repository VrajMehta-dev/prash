import {StyleSheet} from 'react-native';
import {FontFamily, FontSize} from '@config/theme';
import {useTheme} from '@react-navigation/native';
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    disabledOptionStyle: {
      color: BaseColors.textGray,
    },
    radioBtnContainer: {flexDirection: 'row', alignItems: 'center', margin: 10},
    indicatorContainer: disabled => ({
      width: 22,
      height: 22,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: disabled ? BaseColors.secondary : BaseColors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    }),
    indicator: disabled => ({
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: disabled ? BaseColors.secondary : BaseColors.primary,
    }),
    labelText: {
      marginLeft: 15,
      fontSize: FontSize.F18,
      fontFamily: FontFamily.semiBold,
      color: BaseColors.mainFontBlack,
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
