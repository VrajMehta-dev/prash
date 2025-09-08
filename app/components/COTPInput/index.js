/* eslint-disable react-native/no-inline-styles */
import React, { useImperativeHandle, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import moment from 'moment';
import Icon, { Icons } from '@config/Icons';
import { translate } from '@lang/Translate';
import GetStyles from './styles';
import CErrorLog from '@components/CErrorLog';
import debounce from 'lodash.debounce';

const COTPInput = React.forwardRef((props, ref) => {
  const styles = GetStyles();
  const { colors } = useTheme();
  const BaseColors = colors;

  const {
    otpWrapperStyle,
    codeInputFieldStyle,
    code,
    autoFocusOnLoad = false,
    mainContainerStyle,
    keyboardType = 'number-pad',
    pinCount = 6,
    onCodeChanged = () => {},
    onCodeFilled = () => {},
    onFocus = () => {},
    onResend = () => {},
    editable = true,
    showError = false,
    errorMsg = '',
    errorMsgStyle = {},
    resendBtnDisabled = false,
  } = props;

  const [timeExpired, setTimeExpired] = useState(false);
  const [time, setTime] = useState('00:00');
  const [btnLoader, setBtnLoader] = useState(false);

  // ? Reference
  const countdown = useRef(null);
  useImperativeHandle(ref, () => ({
    start(expireAt) {
      CountDown(expireAt);
    },
    stop() {
      clearInterval(countdown.current);
      countdown.current = null;
      setTimeExpired(false);
      return;
    },
  }));

  const dateDiffToString = (a, b) => {
    let diff = Math.abs(a - b);

    let ms = diff % 1000;
    diff = (diff - ms) / 1000;
    let ss = diff % 60;
    diff = (diff - ss) / 60;
    let mm = diff % 60;
    diff = (diff - mm) / 60;

    mm = mm < 10 ? '0' + mm : mm;
    ss = ss < 10 ? '0' + ss : ss;

    return `${mm} : ${ss}`;
  };

  const CountDown = async (expireAt) => {
    countdown.current = setInterval(function () {
      const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
      const expireTime = moment(expireAt).format('YYYY-MM-DD HH:mm:ss');

      const d1 = moment(currentTime).format();
      const d2 = moment(expireTime).format();

      let dt1 = new Date(d1);
      let dt2 = new Date(d2);

      if (dt1 > dt2) {
        setTimeExpired(true);
        clearInterval(countdown.current);
        countdown.current = null;
        setTime('00:00');
        setBtnLoader(false);
      } else {
        const differenceTime = dateDiffToString(dt1, dt2);
        setTime(differenceTime);
        setTimeExpired(false);
        setBtnLoader(false);
      }
    }, 1000);
  };

  // Debounced onCodeFilled function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnCodeFilled = useCallback(
    debounce((code) => {
      onCodeFilled(code);
    }, 300), // 300ms debounce time
    [onCodeFilled]
  );

  return (
    <View style={[styles.mainContainerStyles, mainContainerStyle]}>
      <View style={styles.otpInputContainer}>
        <OTPInputView
          onFocus={onFocus}
          pinCount={pinCount}
          code={code}
          onCodeChanged={onCodeChanged}
          onCodeFilled={(code) => debouncedOnCodeFilled(code)}
          keyboardType={keyboardType}
          autoFocusOnLoad={autoFocusOnLoad}
          editable={editable}
          style={[styles.otpInputViewStyles, otpWrapperStyle]}
          codeInputFieldStyle={[
            styles.codeInputFieldStyle,
            !editable && { backgroundColor: BaseColors.grey, opacity: 0.7 },
            codeInputFieldStyle,
          ]}
          codeInputHighlightStyle={{ borderColor: BaseColors.primary }}
        />
        {!showError ? (
          <CErrorLog textStyle={{ marginTop: 30, fontSize: 16 }} />
        ) : null}
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>{time}</Text>
        <TouchableOpacity
          style={[
            styles.resendBtnContainer,
            { opacity: !timeExpired || btnLoader || resendBtnDisabled ? 0.5 : 1 },
          ]}
          onPress={() => {
            setBtnLoader(true);
            onResend();
          }}
          disabled={!timeExpired || btnLoader || resendBtnDisabled}>
          {btnLoader ? (
            <ActivityIndicator color={BaseColors.primary} size={'small'} />
          ) : (
            <Icon
              type={Icons.Ionicons}
              name="reload"
              style={styles.reloadIcon}
            />
          )}
          <Text style={[styles.resendButton]}>{translate('ResendOTP')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

COTPInput.propTypes = {
  mainContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  otpWrapperStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  codeInputFieldStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  code: PropTypes.string,
  keyboardType: PropTypes.string,
  pinCount: PropTypes.number,
  onCodeChanged: PropTypes.func,
  onCodeFilled: PropTypes.func,
  onFocus: PropTypes.func,
  editable: PropTypes.bool,
};
COTPInput.defaultProps = {
  mainContainerStyle: {},
  otpWrapperStyle: {},
  codeInputFieldStyle: {},
  code: '',
  keyboardType: 'number-pad',
  pinCount: 6,
  onCodeChanged: () => {},
  onCodeFilled: () => {},
  onFocus: () => {},
  editable: true,
};
export default COTPInput;
