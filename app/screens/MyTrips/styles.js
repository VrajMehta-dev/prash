import {Platform, StyleSheet} from 'react-native';
import {FontFamily, FontSize} from '@config/theme';
import {useTheme} from '@react-navigation/native';

const IOS = Platform.OS === 'ios';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BaseColors.white,
    },
    mainContainer: {
      flex: 1,
    },
    container: {
      flexDirection: 'row',
      backgroundColor: BaseColors.grey,
      marginVertical: 10,
      borderRadius: 5,
      marginHorizontal: 20,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 5,
    },
    middleTab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 5,
      borderColor: '#E0E0E0',
      borderLeftWidth: 1,
      borderRightWidth: 1,
    },
    tabText: {
      color: BaseColors.mainFontBlack,
      fontSize: FontSize.F16,
      fontFamily: FontFamily.semiBold,
    },
    activeTab: {
      backgroundColor: BaseColors.primary,
    },
    activeTabText: {
      color: BaseColors.white,
    },
    emptyText: {
      color: BaseColors.mainFontBlack,
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.F32,
      paddingVertical: 20,
      textAlign: 'center',
    },
    modalContainer: {
      paddingHorizontal: 20,
      flex: 1,
      paddingTop: IOS ? 50 : 0,
      backgroundColor: BaseColors.modalBackGround,
    },
    searchContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    listEmptyComponent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
  });
};
export default GetStyles;
