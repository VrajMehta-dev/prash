import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';

const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: BaseColors.white,
    },
    container2: {
      backgroundColor: BaseColors.white,
      paddingHorizontal: 20,
    },
    container3: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    main: {
      flex: 1,
      // marginHorizontal: 12,
      paddingBottom: 10,
      marginTop: 5,
    },
    scrollCard: {
      flex: 1,
      backgroundColor: BaseColors.white,
      paddingHorizontal: 15,
      width: '100%',
    },
    loaderView: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  });
};
export default GetStyles;
