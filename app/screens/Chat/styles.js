import {StyleSheet, Platform, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

const IOS = Platform.OS === 'ios';
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    archivedContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      // paddingHorizontal: 5,
      paddingVertical: 15,
    },
    archivedText: {
      fontFamily: FontFamily.semiBold,
      color: BaseColors.mainFontBlack,
      fontSize: FontSize.F18,
      marginLeft: 10,
    },
    archiveCountContainer: {
      height: 22,
      width: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: BaseColors.primary,
      borderRadius: 20,
    },
    archiveCount: {
      fontFamily: FontFamily.medium,
      color: '#FFFFFF',
      fontSize: FontSize.F14,
    },
    hiddenContainer: {
      justifyContent: 'center',
    },
    hiddenMainContainer: {
      // flex: 1,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    hiddenItem: {
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: BaseColors.grey,
      alignItems: 'flex-end',
    },
    deleteIconContainer: {
      height: 70,
      width: 70,
      borderRadius: 35,
      backgroundColor: BaseColors.red,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editIconContainer: {
      height: 70,
      width: 70,
      borderRadius: 35,
      backgroundColor: BaseColors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: BaseColors.white,
      padding: 5,
    },
    profileImage: {
      height: 53,
      width: 53,
      borderRadius: 53,
    },
    onlineView: {
      width: 16,
      height: 16,
      borderRadius: 16,
      backgroundColor: '#10C10C',
      borderColor: '#FFFFFF',
      borderWidth: 3,
      position: 'absolute',
      left: 40,
      top: 35,
    },
    userInfo: {
      flex: 1,
      marginLeft: 10,
      maxWidth: '70%',
    },
    username: {
      fontSize: FontSize.F14,
      color: BaseColors.secondFontBlack,
      fontFamily: FontFamily.medium,
      marginLeft: 5,
    },
    name: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.semiBold,
      color: BaseColors.mainFontBlack,
      marginBottom: 5,
    },
    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: Dimensions.get('screen').height / 2,
    },
    emptyText: {
      color: BaseColors.mainFontBlack,
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.F20,
      paddingVertical: 20,
      textAlign: 'center',
    },
    emptySecondText: {
      color: BaseColors.thirdFontBlack,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.F14,
      lineHeight: 22,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: IOS ? 50 : 0,
      backgroundColor: BaseColors.white,
    },
    searchContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
  });
};

export default GetStyles;
