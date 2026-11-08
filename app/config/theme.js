/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react-native/no-inline-styles */
import {Appearance, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {BaseToast} from 'react-native-toast-message';

export const BaseColors = {
  red: '#E94235',
  errorColor: '#FF4949',
  green: '#34A853',
  orange: '#FF981F',
  yellow: '#F4C430',
  primary: '#632240', // PRASH brand maroon (was navy; screens already hard-coded this)
  primaryLight: '#7C3AED',
  secondary: '#007BFF',
  accent: '#032CFF',
  darkGrey: '#757575',
  transparent: '#0000',
  inactive: '#DADADA',
  transparentWhite: '#ffffff45',
  borderColor: 'rgba(13, 10, 44, 0.08)',
  textGrey: '#57565B',
  textSecondary: '#858585',
  backgroundColor: '#F6F6F6',
  lightGrey: '#C2C2C2',
  inputBorder: '#C1C1C1',
  white: '#ffffff',
  selection: '#ffccdb',
  whiteSmoke: '#F1F1F1',
  black: '#000000',
  tabinActive: '#6D6D6D',
  white10: '#ffffff10',
  white20: '#ffffff20',
  white30: '#ffffff30',
  white40: '#ffffff40',
  white50: '#ffffff50',
  white60: '#ffffff60',
  white70: '#ffffff70',
  white80: '#ffffff80',
  white90: '#ffffff90',

  black10: '#00000010',
  black20: '#00000020',
  black30: '#00000030',
  black40: '#00000040',
  black50: '#00000050',
  black60: '#00000060',
  black70: '#00000070',
  black80: '#00000080',
  black90: '#00000090',
};

export const lightColors = {
  ...BaseColors,
  borderColor: '#E0E0E0',
  inputLabel: '#212121',
  mainFontBlack: '#212121',
  inputBackGround: '#F5F5F5',
  secondFontBlack: '#424242',
  textColor: '#212121',
  thirdFontBlack: '#616161',
  lightWhite: '#FAFAFA',
  white: '#FFFFFF',
  grey: '#F5F5F5',
  border: '#E0E0E0',
  placeholder: '#616161',
  buttonLabel: '#FFFFFF',
  black: '#212121',
  borderOfDate: '#E0E0E0',
  disableDate: '#E0E0E0',
  modalBackGround: '#FFFFFF',
  tabBorder: '#F5F5F5',
  modalBorder: '#F5F5F5',
  secondPrimary: '#E6F2FF',
  newBorder: '#EEEEEE',
  emptyComponent: '#E6F2FF',
  emptyComponentIcon: '#212121',
  whiteBtn: '#E6F2FF',
};

export const darkColors = {
  ...BaseColors,
  accent: '#032CFF',
  borderColor: '#616161',
  inputLabel: '#E0E0E0',
  mainFontBlack: '#FFFFFF',
  secondFontBlack: '#E0E0E0',
  inputBackGround: '#424242',
  textColor: '#FFFFFF',
  thirdFontBlack: '#E0E0E0',
  lightWhite: '#424242',

  white: '#212121',
  grey: '#424242',
  border: '#E0E0E0',
  placeholder: '#FFFFFF',
  buttonLabel: '#FFFFFF',
  black: '#FFFFFF',
  borderOfDate: '#E0E0E0',
  disableDate: '#424242',
  modalBackGround: '#616161',
  tabBorder: '#F5F5F5',
  modalBorder: '#616161',
  secondPrimary: '#616161',
  newBorder: '#616161',
  emptyComponent: '#FFF0',
  emptyComponentIcon: '#057FFF',
  whiteBtn: '#424242',
};

export const FontFamily = {
  light: 'Poppins-Light',
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  bold: 'Poppins-Bold',
  semiBold: 'Poppins-SemiBold',
  black: 'Poppins-Black',
};

export const FontSize = {
  F32: 32,
  F30: 30,
  F28: 28,
  F26: 26,
  F24: 24,
  F22: 22,
  F20: 20,
  F18: 18,
  F16: 16,
  F14: 14,
  F12: 12,
  F10: 10,
  F8: 8,
};

export const GetTypography = () => {
  const {colors} = useTheme();
  const themeColors = colors;
  return StyleSheet.create({
    pageTitle: {
      fontFamily: FontFamily.semiBold,
      fontSize: 23,
    },
    descriptionTitle: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.F14,
    },
    screenHeaderText: {
      fontSize: FontSize.F28,
      fontFamily: FontFamily.bold,
      color: themeColors.textColor,
      lineHeight: 51,
    },
    screenDescriptionText: {
      fontSize: FontSize.F16,
      fontFamily: FontFamily.regular,
      color: 'black',
      lineHeight: 28,
    },
    iconTitle: {
      fontFamily: FontFamily.medium,
      fontSize: FontSize.F14,
      color: themeColors.mainFontBlack,
    },
    formLabel: {
      color: themeColors.inputLabel,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.F16,
    },
    buttomLabel: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.F16,
    },
    CInputText: {
      color: themeColors.mainFontBlack,
      fontSize: FontSize.F18,
      fontFamily: FontFamily.semiBold,
    },
    comingSoon: {
      fontSize: FontSize.F26,
      fontFamily: FontFamily.semiBold,
    },
    semiTitle: {
      fontSize: FontSize.F20,
      fontFamily: FontFamily.bold,
      color: themeColors.mainFontBlack,
    },
    viewAll: {
      fontSize: FontSize.F16,
      fontFamily: FontFamily.bold,
      color: themeColors.primary,
    },
    lastUpdatedAt: {
      fontSize: FontSize.F18,
      fontFamily: FontFamily.semiBold,
      color: themeColors.secondFontBlack,
    },
  });
};

export const ToastConfig = () => {
  const colorScheme = Appearance.getColorScheme();
  const {theme, darkmode} = useSelector(state => state.auth);
  const isDarkMode =
    theme == 'systemDefault' ? colorScheme == 'dark' : darkmode;
  const themeColors = isDarkMode ? darkColors : lightColors;
  return {
    /*
          Overwrite 'success' type,
          by modifying the existing `BaseToast` component
        */
    success: props => (
      <BaseToast
        {...props}
        text1="Success"
        style={{borderLeftColor: themeColors.green, marginTop: 25}}
        contentContainerStyle={{
          paddingHorizontal: 15,
          backgroundColor: `${themeColors.green}20`,
          borderWidth: 1,
          borderColor: `${themeColors.green}50`,
          borderTopRightRadius: 5,
          borderBottomRightRadius: 5,
        }}
        text1Style={{
          fontSize: FontSize.F14,
          fontWeight: null,
          fontFamily: FontFamily.semiBold,
        }}
        text2NumberOfLines={2}
        text2Style={{
          fontSize: FontSize.F12,
          fontFamily: FontFamily.regular,
        }}
      />
    ),
    /*
      Overwrite 'inf' type,
      by modifying the existing `BaseToast` component
    */
    info: props => (
      <BaseToast
        {...props}
        text1="Information!"
        style={{borderLeftColor: themeColors.primary, marginTop: 25}}
        contentContainerStyle={{
          paddingHorizontal: 15,
          backgroundColor: `${themeColors.primary}20`,
          borderWidth: 1,
          borderColor: `${themeColors.primary}50`,
          borderTopRightRadius: 5,
          borderBottomRightRadius: 5,
        }}
        text1Style={{
          fontSize: FontSize.F14,
          fontWeight: null,
          fontFamily: FontFamily.semiBold,
        }}
        text2NumberOfLines={2}
        text2Style={{
          fontSize: FontSize.F12,
          fontFamily: FontFamily.bold,
        }}
      />
    ),
    /*
      Overwrite 'error' type,
      by modifying the existing `BaseToast` component
    */
    error: props => (
      <BaseToast
        {...props}
        text1="Oops!"
        style={{borderLeftColor: themeColors.red, marginTop: 25}}
        contentContainerStyle={{
          paddingHorizontal: 15,
          backgroundColor: `${themeColors.red}20`,
          borderWidth: 1,
          borderColor: `${themeColors.red}50`,
          borderTopRightRadius: 5,
          borderBottomRightRadius: 5,
        }}
        text1Style={{
          fontSize: FontSize.F14,
          fontWeight: null,
          fontFamily: FontFamily.semiBold,
        }}
        text2Style={{
          fontSize: FontSize.F12,
          fontFamily: FontFamily.regular,
        }}
        text2NumberOfLines={2}
      />
    ),
    /*
      Create new type 'white',
      by modifying the existing `BaseToast` component
    */
    white: props => (
      <BaseToast
        {...props}
        style={{
          marginTop: 70,
          width: '30%',
          borderLeftWidth: 0,
          borderRadius: 12,
          backgroundColor: themeColors.modalBackGround,
        }}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        text1NumberOfLines={1}
        text1Style={{
          fontSize: FontSize.F16,
          fontWeight: null,
          textAlign: 'center',
          fontFamily: FontFamily.semiBold,
          color: themeColors.mainFontBlack,
        }}
        text2Style={{
          display: 'none',
        }}
      />
    ),
  };
  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
};
