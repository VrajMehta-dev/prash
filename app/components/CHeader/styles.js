import {Platform, StatusBar, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily} from '@config/theme';

const IOS = Platform.OS === 'ios';
const height = 36;
const GetStyles = () => {
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 10,
      paddingTop: IOS ? null : StatusBar.currentHeight + 10,
      zIndex: 5,
    },
    leftContainer: {
      alignItems: 'flex-start',
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
    },
    rightContainer: {
      alignItems: 'flex-end',
    },
    emptyLeftIconContainer: {
      height: height,
      width: 36,
    },
    iconContainer: {
      height: height,
      width: 36,
      borderRadius: 5,
      backgroundColor:"transparent",
      borderWidth: 1,
      borderColor: BaseColors.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer1: {
      height: height,
      minWidth: 65,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: BaseColors.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      fontSize: 22,
      color: BaseColors.black,
    },
    drawerIcon: {
      fontSize: 22,
      color: BaseColors.textColor,
    },
    notificationIcon: {
      fontSize: 19,
      color: BaseColors.textColor,
    },
    clearSty: {
      fontSize: 14,
      color: BaseColors.textColor,
      fontFamily: FontFamily.medium,
      textAlign: 'right',
    },
    disabled: {
      opacity: 0.7,
      backgroundColor: BaseColors.grey20,
    },
  });
};

export default GetStyles;
