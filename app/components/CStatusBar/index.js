import React from 'react';
import {Appearance, StatusBar} from 'react-native';
import {useSelector} from 'react-redux';
import {useTheme} from '@react-navigation/native';

const CStatusBar = () => {
  const {theme, darkMode} = useSelector(state => state.auth);
  const colorScheme = Appearance.getColorScheme();
  const {colors} = useTheme();
  const BaseColors = colors;
  const isDarkMode =
    theme == 'systemDefault' ? colorScheme == 'dark' : darkMode;

  return (
    <StatusBar
      translucent
      backgroundColor={'#0000'}
      barStyle={isDarkMode ? 'light-content' : 'dark-content'}
    />
  );
};

export default CStatusBar;
