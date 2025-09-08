import { StyleSheet } from 'react-native';
import { FontFamily } from '@config/theme';

const GetStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f4f7',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    logoImage: {
      width: 160,
      height: 160,
      marginBottom: 24,
      borderRadius: 80,
    },
    logoTextContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logoText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#000',
      fontFamily: FontFamily?.bold || 'sans-serif',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000033',
      textAlign: 'center',
    },
  });

export default GetStyles;
