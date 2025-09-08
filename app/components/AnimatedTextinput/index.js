import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Animated,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const AnimatedTextInput = ({
  label,
  value,
  onChangeText,
  icon,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const animatedLabelPosition = useRef(
    new Animated.Value(value ? 1 : 0),
  ).current;
  const animatedBorderWidth = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate label position when value changes
    Animated.timing(animatedLabelPosition, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Animate border width
    Animated.timing(animatedBorderWidth, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (error) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, value, error]);

  const labelStyle = {
    position: 'absolute',
    left: icon ? 45 : 16,
    top: animatedLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [17, -10],
    }),
    fontSize: animatedLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ['#666', '#2196F3'],
    }),
    backgroundColor: error ? '#FFEBEE' : '#fff',
    paddingHorizontal: 4,
    borderRadius: 4,
  };

  const borderColor = animatedBorderWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#FF5252' : '#E0E0E0', error ? '#FF5252' : '#2196F3'],
  });

  const handleFocus = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFocused(true);
  };

  const handleBlur = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: error ? '#FFEBEE' : '#fff',
          },
        ]}>
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={error ? '#FF5252' : isFocused ? '#2196F3' : '#666'}
            style={styles.icon}
          />
        )}

        <Animated.Text style={labelStyle}>{label}</Animated.Text>

        <TextInput
          style={[styles.input, icon && {paddingLeft: 40}]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          secureTextEntry={!showPassword}
          autoCapitalize={autoCapitalize}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}

        {value && !secureTextEntry && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChangeText('')}>
            <Icon name="cancel" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && (
        <Animated.Text style={[styles.errorText, {opacity: fadeAnim}]}>
          <Icon name="error-outline" size={14} color="#FF5252" /> {error}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputContainer: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    height: '100%',
    color: '#333',
  },
  icon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});

export default AnimatedTextInput;
