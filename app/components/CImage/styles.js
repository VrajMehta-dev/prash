import {Dimensions, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const GetStyles = () => {
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    profileImage: {
      height: 53,
      width: 53,
      borderRadius: 53,
    },
  });
};

export default GetStyles;
