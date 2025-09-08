import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily} from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
    },
  });
};
export default GetStyles;
