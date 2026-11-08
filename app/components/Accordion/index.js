/* eslint-disable react/react-in-jsx-scope */
// Disabling eslint rule for avoiding the "React must be in scope" error
import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {Platform, Text, View} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from '@react-navigation/native';
import WebView from 'react-native-webview';
import {Icons} from '@config/Icons';
import {CustomIcon} from '@config/LoadIcons';
import GetStyles from './styles';

const IOS = Platform.OS === 'ios';
const Accordion = forwardRef((props, ref) => {
  const {colors} = useTheme();
  const BaseColors = colors;
  const styles = GetStyles(BaseColors);

  // Destructuring props to extract title, description, and onPress function
  const {title = '', description = '', onPress = () => {}, style = {}} = props;

  // Custom hook for handling imperative logic with refs
  useImperativeHandle(ref, () => ({
    close() {
      close();
    },
  }));

  // Shared value for managing animated state
  const shareValue = useSharedValue(0);
  // State to hold the height of the body section
  const [bodySectionHeight, setBodySectionHeight] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Animated style for controlling the height of the body section
  const bodyHeight = useAnimatedStyle(() => ({
    height: interpolate(shareValue.value, [0, 1], [0, bodySectionHeight]),
    // opacity: shareValue.value,
  }));

  // Animated style for controlling the rotation of the icon
  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(shareValue.value, [0, 1], [0, 180])}deg`,
        },
      ],
    };
  });

  // Function to close the accordion by animating the shared value
  const close = () => {
    setIsExpanded(false);
    shareValue.value = withTiming(0, {
      duration: 500,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });
  };

  // Function to toggle the accordion by animating the shared value
  const toggleButton = () => {
    setIsExpanded(!isExpanded);
    if (shareValue.value === 0) {
      shareValue.value = withTiming(1, {
        duration: 500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });
    } else {
      shareValue.value = withTiming(0, {
        duration: 500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });
    }
  };

  const [webViewHeight, setWebViewHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);

  const defaultStyle = `
  <head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Urbanist&display=swap" rel="stylesheet">
  <style>
    html, body {overflow-x: auto; color:${BaseColors.mainFontBlack}; word-break: 'break-all';  white-space: 'wrap'; font-family: 'Urbanist', sans-serif;}img {display: inline; height: auto; max-width: 100%;}
    </style>
  </head>`;
  const defaultHead = `<meta name="viewport" content="width=device-width,  initial-scale=1.0, maximum-scale=1.0,user-scalable=0">${defaultStyle}`;

  // this function manage the height of view according to content
  const handleWebViewMessage = event => {
    const contentHeight = parseInt(event.nativeEvent.data, IOS ? 11 : 10);
    setBodySectionHeight(contentHeight);
    setWebViewHeight(contentHeight);
  };

  // JSX structure for the Accordion component
  return (
    <View style={[styles.subContainer, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.btnStyle}
        onPress={() => {
          onPress();
          toggleButton();
        }}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={[styles.arrowIconContainer, iconStyle]}>
          <CustomIcon
            type={Icons.MaterialIcons}
            name="Arrow---Down-2"
            style={[styles.arrowIcon]}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.descStyle(isExpanded), bodyHeight]}>
        <View style={styles.divider} />
        <WebView
          ref={webViewRef}
          source={{html: `${defaultHead}${description}`}}
          onMessage={handleWebViewMessage}
          style={{
            height: webViewHeight,
            backgroundColor: 'transparent',
            color: BaseColors.mainFontBlack,
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          scrollEnabled={false}
          injectedJavaScript={`(
            function() {
                function sendHeight() {
                  const height = document.body.scrollHeight;
                  window.ReactNativeWebView.postMessage(height.toString());
                }
                document.addEventListener('DOMContentLoaded', sendHeight); // Check when DOM is ready
                window.onload = sendHeight; // Check when everything is fully loaded
                setTimeout(sendHeight, 100); // Fallback in case other events fail
            }
          )();`}
        />
      </Animated.View>
    </View>
  );
});

export default Accordion;
