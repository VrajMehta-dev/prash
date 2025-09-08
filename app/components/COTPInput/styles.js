import {StyleSheet} from 'react-native';
import {FontFamily, FontSize} from '@config/theme';
import {useTheme} from '@react-navigation/native';

const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    mainContainerStyles: {
      marginBottom: 25,
    },
    otpInputContainer: {
      alignItems: 'center',
    },
    otpInputViewStyles: {
      flex: 1,
      height: 50,
      width: '80%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    codeInputFieldStyle: {
      width: 55,
      height: 55,
      borderRadius: 60,
      fontFamily: FontFamily.medium,
      color: BaseColors.textColor,
      fontSize: FontSize.F18,
      padding: 0,
      margin: 0,
      paddingTop: 4,
      backgroundColor: BaseColors.inputBackGround,
    },
    errorContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(254, 51, 35, 0.08)',
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
    },
    errorMsgText: {
      fontFamily: FontFamily.regular,
      textAlign: 'left',
      color: '#F75555',
      marginStart: 5,
      marginEnd: 24,
      fontSize: FontSize.F14,
      flex: 1,
    },

    resendContainer: {
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resendText: {
      fontSize: FontSize.F16,
      marginRight: 10,
      fontFamily: FontFamily.medium,
      color: BaseColors.primary,
    },
    resendBtnContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    reloadIcon: {
      fontSize: FontSize.F18,
      color: BaseColors.primary,
    },
    resendButton: {
      fontSize: FontSize.F16,
      fontFamily: FontFamily.medium,
      color: BaseColors.primary,
      marginLeft: 5,
    },
  });
};
export default GetStyles;
