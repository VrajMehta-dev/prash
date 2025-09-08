import {Dimensions, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';

const GetStyles = () => {
  const {colors} = useTheme();
  const BaseColors = colors;
  return StyleSheet.create({
    backgroundContainer: {
      flex: 1,
      zIndex: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    blurView: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    warningModalContainer: {
      width: '90%',
      alignSelf: 'center',
      borderRadius: 10,
    },

    modalMainView: {
      flex: 1,
      justifyContent: 'flex-end',
      zIndex: 10,
    },
    modalView: {
      backgroundColor: BaseColors.white,
      elevation: 5,
      borderTopRightRadius: 25,
      borderTopLeftRadius: 25,
    },
    modalTopGradientContainer: {
      position: 'absolute',
      top: 20,
      left: 0,
      zIndex: -100,
    },
    modalBottomGradientContainer: {
      position: 'absolute',
      bottom: 20,
      // left: 0,
      right: 0,
      zIndex: -100,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    videoPlayer: {
      height: Dimensions.get('screen').height / 2,
      width: '100%',
      borderRadius: 5,
      backgroundColor: BaseColors.black,
    },
    videoPlayerLoader: {
      height: '100%',
      width: '100%',
      borderRadius: 5,
    },
    pdfViewer: {
      height: Dimensions.get('screen').height / 2,
      borderWidth: 1,
      borderColor: BaseColors.lightGray,
      backgroundColor: BaseColors.white,
      borderRadius: 10,
    },
    closeIconContainer: {
      position: 'absolute',
      // top: StatusBar.currentHeight + 10,
      // right: 15,
      bottom: 30,
      height: 45,
      width: 45,
      borderRadius: 25,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};

export default GetStyles;
