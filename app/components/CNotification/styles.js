import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const GetStyles = () => {
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    cardStyle: {
      paddingVertical: 10,
      marginHorizontal: 20,
      backgroundColor: BaseColors.white,
    },
    container: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      backgroundColor: '#E6F2FF',
      borderRadius: 30,
      borderWidth: 1,
      borderColor: BaseColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      height: 54,
      width: 54,
    },
    unReadContainer: {
      height: 18,
      width: 18,
      borderRadius: 20,
      position: 'absolute',
      backgroundColor: BaseColors.primary,
      borderWidth: 3,
      borderColor: BaseColors.white,
      right: -2,
      top: -2,
    },
    notificationIcon: {
      fontSize: 26,
      color: BaseColors.primary,
      marginTop: 2,
    },
    textContainer: {
      flex: 1,
      paddingLeft: 20,
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: FontFamily.bold,
      fontSize: FontSize.F18,
      color: BaseColors.mainFontBlack,
      paddingBottom: 5,
      width: '75%',
    },
    time: isUnread => ({
      fontFamily: isUnread ? FontFamily.bold : FontFamily.medium,
      fontSize: FontSize.F14,
      color: isUnread ? BaseColors.mainFontBlack : BaseColors.thirdFontBlack,
    }),
    message: {
      fontFamily: FontFamily.medium,
      fontSize: FontSize.F14,
      color: BaseColors.thirdFontBlack,
    },
    readMoreText: {
      fontSize: FontSize.F14,
      color: BaseColors.primary,
      fontFamily: FontFamily.medium,
    },
    titleText: {
      fontSize: FontSize.F20,
      color: BaseColors.mainFontBlack,
      fontFamily: FontFamily.medium,
      paddingHorizontal: 20,
    },
  });
};

export default GetStyles;
