import {StyleSheet, Platform} from 'react-native';
import {useTheme} from '@react-navigation/native';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  const IOS = Platform.OS === 'ios';
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BaseColors.white,
    },
    mainContainer: {
      flex: 1,
      paddingBottom: 20,
    },
  });
};
export default GetStyles;
