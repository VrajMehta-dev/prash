import {StyleSheet, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;

  return StyleSheet.create({
    animationWrap: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    animation: {
      height: 300,
      width: 200,
    },
    blurView: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    mainViewModal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: BaseColors.white,
      borderRadius: 10,
      width: Dimensions.get('window').width / 1.1,
      padding: 20,
    },
    offlineTitle: {
      fontSize: FontSize.F28,
      color: BaseColors.textColor,
      fontFamily: FontFamily.semiBold,
      textAlign: 'center',
    },
    offlineSubTxt: {
      fontSize: FontSize.F16,
      color: BaseColors.textColor,
      fontFamily: FontFamily.medium,
      marginTop: 5,
      textAlign: 'center',
    },
  });
};
