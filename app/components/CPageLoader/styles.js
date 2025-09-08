import {Dimensions, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    root: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyListContainer: {
      height: Dimensions.get('screen').height / 1.6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyListLottie: {
      height: 200,
      width: 200,
    },
    titleText: {
      color: 'black',
      fontFamily: FontFamily.medium,
      fontSize: FontSize.F22,
      marginBottom: 15,
      textAlign: 'center',
    },
    descriptionText: {
      color: BaseColors.thirdFontBlack,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.F18,
      lineHeight: 22,
      paddingHorizontal: 20,
      textAlign: 'center',
    },
    iconContainer: {
      paddingHorizontal: 30,
      paddingVertical: 28,
      backgroundColor: BaseColors.emptyComponent,
      borderWidth: 1,
      borderColor: BaseColors.primary,
      borderRadius: 100,
      marginBottom: 20,
    },
    loadMoreStyle: {
      paddingVertical: 30,
    },
  });
};
export default GetStyles;
