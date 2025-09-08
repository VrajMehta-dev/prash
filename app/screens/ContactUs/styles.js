import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const GetStyles = () => {
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BaseColors.white,
      paddingHorizontal: 20,
    },
    mainContainer: {
      flex: 1,
      paddingBottom: 20,
    },
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: BaseColors.primary,
      padding: 20,
      alignItems: 'center',
      borderRadius: 12,
      justifyContent: 'space-between',
      marginVertical: 20,
    },
    iconContainer: {
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: 10,
    },
    title: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.regular,
      color: 'white',
    },
    description: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.bold,
      color: 'white',
      flex: 1,
    },
    desContainer: {
      flex: 1,
      marginLeft: 15,
    },
    btnstyle: {
      justifyContent: 'flex-end',
      marginVertical: 20,
    },
    chatContainer: {
      backgroundColor: '#E6F2FF',
      borderRadius: 12,
      padding: 20,
    },
    chatTitle: {
      color: '#212121',
      fontFamily: FontFamily.bold,
      fontSize: FontSize.F20,
    },
    imageStyle: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    chatDesciption: {
      fontSize: FontSize.F16,
      color: '#616161',
      fontFamily: FontFamily.regular,
      marginLeft: 15,
      flex: 1,
    },
    chatDesContainer: {
      flexDirection: 'row',
      paddingVertical: 20,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

export default GetStyles;
