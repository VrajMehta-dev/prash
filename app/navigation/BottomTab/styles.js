import {Platform, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  const IOS = Platform.OS === 'ios';
  return StyleSheet.create({
    tabContainer: {
      backgroundColor: BaseColors.white,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: IOS ? 0.32 : 0.32,
      shadowRadius: IOS ? 4.9 : 20,
      elevation: 7,
    },
    bottomTabIcons: {
      fontSize: FontSize.F24,
      color: BaseColors.textColor,
    },
    tabBar: {
      flexDirection: 'row',
    },
    tab: {
      flex: 1,
      paddingBottom: IOS ? 18 : 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      alignItems: 'center',
      paddingTop: 15,
      backgroundColor: BaseColors.white,
    },
    icon: {
      fontSize: 25,
    },
    label: {
      color: BaseColors.lightGrey,
      paddingTop: 4,
      fontSize: FontSize.F10,
      fontFamily: FontFamily.regular,
    },
    slider: {
      height: 2,
      position: 'absolute',
      top: 0,
      left: 10,
      right: 10,
      backgroundColor: BaseColors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomTabLabels: {
      color: BaseColors.primary,
      fontSize: FontSize.F14,
      lineHeight: 22.4,
    },
    countContainer: {
      width: 18,
      height: 18,
      zIndex: 10,
      position: 'absolute',
      left: 12,
      top: 10,
      backgroundColor: BaseColors.red,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    countText: {
      color: 'white',
      fontSize: FontSize.F10,
      fontFamily: FontFamily.regular,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabel: {
      fontSize: 12,
      marginTop: 4,
    },
    centerButtonContainer: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      alignItems: 'center',
    },
    createButton: {
      backgroundColor: '#6c63ff',
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
    },
    expandableMenu: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 150,
      alignItems: 'center',
    },
    menuItem: {
      backgroundColor: '#6c63ff',
      borderRadius: 20,
      padding: 10,
      marginVertical: 5,
      alignItems: 'center',
      flexDirection: 'row',
    },
  });
};
export default GetStyles;
