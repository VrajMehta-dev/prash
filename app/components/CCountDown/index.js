/* eslint-disable react-native/no-inline-styles */
import React, {useImperativeHandle, useRef, useState} from 'react';
import {View, Text} from 'react-native';
import {useTheme} from '@react-navigation/native';
import moment from 'moment';
import PropTypes from 'prop-types';
import GetStyles from './styles';

const CCountDown = React.forwardRef((props, ref) => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {mainContainerStyle = {}, onTimeOut = () => {}} = props;

  const [timeExpired, setTimeExpired] = useState(false);
  const [time, setTime] = useState('00:00');

  // ? Reference
  const countdown = useRef(null);
  useImperativeHandle(ref, () => ({
    start(expireAt) {
      console.log('🚀 ~ App ~ start ~ expireAt->', expireAt);
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
    let hh = diff % 24;

    hh = hh < 10 ? '0' + hh : hh;
    mm = mm < 10 ? '0' + mm : mm;
    ss = ss < 10 ? '0' + ss : ss;

    if (hh == '0' || hh == 0 || hh == '00') {
      return `${mm} : ${ss}`;
    } else {
      return `${hh} : ${mm} : ${ss}`;
    }
  };

  const CountDown = async expireAt => {
    if (expireAt) {
      countdown.current = setInterval(function () {
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const expireTime = moment(expireAt).format('YYYY-MM-DD HH:mm:ss');

        const d1 = moment(currentTime).format();
        const d2 = moment(expireTime).format();

        let dt1 = new Date(d1);
        let dt2 = new Date(d2);

        if (dt1 > dt2) {
          onTimeOut();
          setTimeExpired(true);
          clearInterval(countdown.current);
          countdown.current = null;
          setTime('00 : 00');
        } else {
          const differenceTime = dateDiffToString(dt1, dt2);
          setTime(differenceTime);
          setTimeExpired(false);
        }
      }, 1000);
    } else {
      onTimeOut();
      setTime('00 : 00');
    }
  };

  return (
    <View style={[mainContainerStyle]}>
      <Text style={styles.resendText}>{time}</Text>
    </View>
  );
});

CCountDown.propTypes = {
  mainContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
CCountDown.defaultProps = {
  mainContainerStyle: {},
};
export default CCountDown;
