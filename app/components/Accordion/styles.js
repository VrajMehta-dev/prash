import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily} from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    arrowIconContainer: {
      width: '10%',
      alignItems: 'flex-end',
    },
    arrowIcon: {
      fontSize: 24,
      color: '#616161',
    },
    btnStyle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 20,
    },
    subContainer: {
      paddingHorizontal: 20,
      marginBottom: 12,
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: BaseColors.grey,
    },
    descStyle: isOpen => ({
      borderTopWidth: isOpen ? 1 : 0,
      borderTopColor: BaseColors.grey,
      overflow: 'hidden',
    }),
    title: {
      width: '90%',
      fontSize: 18,
      fontFamily: FontFamily.bold,
      color: BaseColors.mainFontBlack,
      borderBottomColor: BaseColors.red,
    },
    descriptionText: {
      fontSize: 16,
      fontFamily: FontFamily.medium,
      color: BaseColors.secondFontBlack,
      paddingTop: 16,
      lineHeight: 25.6,
    },
    bodyContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      paddingBottom: 20,
    },
    divider: {
      width: '100%',
      height: 1,
      backgroundColor: BaseColors.grey,
    },
  });
};
export default GetStyles;
