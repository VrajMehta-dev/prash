// OtpInput.js
import React, {useRef, useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';

const OtpInput = ({length = 6, onComplete}) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputs = useRef([]);

  const focusNext = index => {
    if (index < length - 1 && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  const focusPrev = index => {
    if (index > 0 && inputs.current[index - 1]) {
      inputs.current[index - 1].focus();
    }
  };

  const handleChangeText = (text, index) => {
    // Handle paste functionality
    if (text.length > 1) {
      // This is likely a paste operation
      const pastedText = text.replace(/\D/g, '').slice(0, length); // Remove non-digits and limit to length
      const newOtp = Array(length).fill('');
      
      // Fill the OTP array with pasted text
      for (let i = 0; i < pastedText.length; i++) {
        newOtp[i] = pastedText[i];
      }
      
      setOtp(newOtp);
      
      // Focus the next empty field or the last field if all filled
      const nextIndex = Math.min(pastedText.length, length - 1);
      if (inputs.current[nextIndex]) {
        inputs.current[nextIndex].focus();
      }
      
      // Check if OTP is complete
      if (newOtp.every(val => val !== '') && onComplete) {
        onComplete(newOtp.join(''));
      }
      return;
    }

    // Normal single character input
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text) {
      focusNext(index);
    }

    if (newOtp.every(val => val !== '') && onComplete) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyPress = ({nativeEvent: {key}}, index) => {
    if (key === 'Backspace' && !otp[index]) {
      focusPrev(index);
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((value, index) => (
        <TextInput
          key={index}
          ref={ref => (inputs.current[index] = ref)}
          style={[
            styles.input,
            {marginHorizontal: index !== 0 || index !== length - 1 ? 10 : 0},
          ]}
          keyboardType="numeric"
          maxLength={length} // Allow pasting longer text
          onChangeText={text => handleChangeText(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          value={value}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  input: {
    borderBottomWidth: 2,
    paddingBottom: 10,
    borderBottomColor: '#000',
    width: 40,
    color: 'black',
    textAlign: 'center',
    fontSize: 20,
  },
});

export default OtpInput;
