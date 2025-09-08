import {StyleSheet} from 'react-native';
import {FontFamily, FontSize} from '@config/theme';
import {useTheme} from '@react-navigation/native';
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    popOver: {
      borderRadius: 10,
      padding: 5,
      backgroundColor: BaseColors.modalBackGround,
      elevation: 4,
      minHeight: 2,
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.4,
      shadowRadius: 4.0,
    },
    arrow: {
      height: 0,
      width: 0,
    },
    popOverBackground: {
      backgroundColor: 'transparent',
    },
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderColor: BaseColors.grey,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    icon: {
      fontSize: 16,
      color: BaseColors.mainFontBlack,
    },
    text: {
      color: BaseColors.mainFontBlack,
      fontSize: FontSize.F16,
      fontFamily: FontFamily.semiBold,
      paddingLeft: 10,
    },
  });
};
export default GetStyles;
