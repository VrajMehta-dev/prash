import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily} from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: BaseColors.tabBorder,
      borderRadius: 2,
    },
    flag: {
      borderRadius: 2,
    },
  });
};
export default GetStyles;
