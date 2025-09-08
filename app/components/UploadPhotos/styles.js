import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FontFamily, FontSize} from '@config/theme';

// Define your styles within a functional component
const GetStyles = () => {
  // Access theme colors using useTheme hook
  const {colors} = useTheme();
  const BaseColors = colors;

  return StyleSheet.create({
    uploadText: {
      fontSize: FontSize.F14,
      fontFamily: FontFamily.regular,
      color: BaseColors.thirdFontBlack,
      // marginTop: 10,
      marginBottom: 10,
    },
    attachMaxUploadText: {
      fontSize: FontSize.F14,
      fontFamily: FontFamily.regular,
      color: BaseColors.thirdFontBlack,
      marginTop: 6,
      marginBottom: 10,
    },
    imageContainer: {
      flexDirection: 'row',
    },
    imageWrapper: {
      position: 'relative',
    },
    image: {
      height: 82,
      width: 82,
      borderRadius: 80,
      marginHorizontal: 10,
    },
    addButton: {
      width: 82,
      height: 82,
      borderRadius: 80,
      backgroundColor: '#FAFAFA',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      width: 17,
      height: 17,
      position: 'absolute',
      right: 15,
      backgroundColor: BaseColors.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
    profileImageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },
    profileImageUploadBtn: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      bottom: 2,
      right: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3, //
      position: 'absolute',
      borderRadius: 15,
    },

    labelContainer: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    label: {
      marginBottom: 10,
    },
    requiredIcon: {
      fontSize: FontSize.F8,
      color: BaseColors.red,
      marginLeft: 2,
    },
    // Attach Files
    fileContainer: {
      flexDirection: 'row',
      backgroundColor: BaseColors.grey,
      padding: 15,
      alignItems: 'center',
      borderRadius: 7,
      flex: 1,
      marginBottom: 15,
    },
    fileTextContainer: {
      flex: 1,
      paddingHorizontal: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    filePlaceholder: {
      color: BaseColors.thirdFontBlack,
      fontSize: FontSize.F18,
      fontFamily: FontFamily.regular,
      flex: 1,
      paddingHorizontal: 10,
    },
    fileText: {
      color: BaseColors.mainFontBlack,
      fontSize: FontSize.F16,
      fontFamily: FontFamily.semiBold,
    },

    // RBSheet modal Styles
    uploadModal: {
      padding: 20,
    },
    uploadModalIconAndTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: BaseColors.tabBorder,
    },
    uploadModalIcon: {
      fontSize: 25,
      color: BaseColors.mainFontBlack,
    },
    uploadModalTitleText: {
      fontSize: 16,
      fontFamily: FontFamily.semiBold,
      color: BaseColors.mainFontBlack,
      textAlign: 'center',
      marginLeft: 10,
    },
    chatUploadIconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chatAttachIcon: {
      fontSize: 24,
      color: BaseColors.black,
      marginHorizontal: 10,
    },
    cameraIcon: {
      fontSize: 24,
      color: BaseColors.black,
    },

    errorContainer: {
      backgroundColor: 'rgba(254, 51, 35, 0.1)',
      padding: 8,
      marginTop: 5,
      borderRadius: 6,
      flexDirection: 'row',
    },
    errorText: {
      fontFamily: FontFamily.regular,
      textAlign: 'left',
      color: '#F75555',
      marginStart: 5,
      marginEnd: 24,
      fontSize: FontSize.F14,
    },
    errorIcon: {
      fontSize: FontSize.F18,
      color: BaseColors.red,
    },
    csvUploadModal: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 10,
    },
    csvDescriptionText: {
      color: BaseColors.thirdFontBlack,
      fontSize: FontSize.F18,
      fontFamily: FontFamily.regular,
      marginBottom: 30,
      textAlign: 'center',
    },
    btnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    btn: {
      width: '48.5%',
    },
  });
};

export default GetStyles;
