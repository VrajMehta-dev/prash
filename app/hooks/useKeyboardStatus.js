import {useState, useEffect} from 'react';
import {Keyboard, LayoutAnimation, Platform} from 'react-native';

const IOS = Platform.OS === 'ios';
function useKeyboardStatus() {
  const [isVisible, setIsVisible] = useState(false);

  // Enable layout animation on Android
  // if (Platform.OS === 'android') {
  //   UIManager.setLayoutAnimationEnabledExperimental(true);
  // }

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      IOS ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        if (IOS) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setIsVisible(true);
      },
    );
    const hideSubscription = Keyboard.addListener(
      IOS ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        if (IOS) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setIsVisible(false);
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isVisible;
}

export default useKeyboardStatus;
