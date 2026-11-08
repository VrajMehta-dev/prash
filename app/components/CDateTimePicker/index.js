/* eslint-disable max-len */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable no-nested-ternary */
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {View, Text} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import {useTheme} from '@react-navigation/native';
import Icon, {Icons} from '@config/Icons';
import {CustomIcon} from '@config/LoadIcons';
import {GetTypography} from '@config/theme';
import GetStyles from './styles';
import CErrorLog from '@components/CErrorLog';

const CDateTimePicker = forwardRef((props, ref) => {
  const {
    value = '',
    mode = 'date',
    label = '',
    onDateChange = () => {},
    cStyle = {},
    textInputStyle = {},
    showError = false,
    errorMsg = '',
    required = false,
    placeholder = '',
    minDate = null,
    maxDate = new Date(),
    disabled = false,
    labelFormat = '',
    valueFormat = '',
    style = {},
    defaultValue = null,
  } = props;

  // Custom hook for handling imperative logic with refs
  useImperativeHandle(ref, () => ({
    open() {
      setShow(true);
    },
    close() {
      setShow(false);
    },
  }));

  const styles = GetStyles();
  const Typography = GetTypography();
  const {colors} = useTheme();
  const BaseColors = colors;

  // State Variables
  const [show, setShow] = useState(false);

  const getFormat = dtMode => {
    switch (dtMode) {
      case 'value':
        return 'MMM DD, YYYY  |  hh:mm A';
      case 'date/time':
        return 'YYYY-MM-DD HH:mm:ss';
      case 'date':
        return 'MM/DD/YYYY';
      case 'time':
        return 'HH:mm';
      case 'timeA':
        return 'hh:mm A';
      case 'dateOfBirth':
        return 'MMM DD, YYYY';
      case 'YYYY-MM-DD':
        return 'YYYY-MM-DD';
      default:
        return 'MM-DD-YYYY';
    }
  };

  const onChange = selectedDate => {
    const currentDate = selectedDate || moment(value, getFormat('date'));
    setShow(false);
    if (mode == 'time') {
      const time24Hour = moment(selectedDate).format(valueFormat || 'HH:mm');
      onDateChange(time24Hour);
    } else {
      onDateChange(moment(currentDate).format(getFormat(valueFormat)));
    }
  };

  // change date picker mode
  const showMode = () => {
    setShow(true);
  };

  function renderDatePicker() {
    const utcMomentDate = moment(
      minDate || defaultValue || new Date(),
    ).format();

    const inputDate = !_.isEmpty(value)
      ? moment(value, getFormat(valueFormat))
      : utcMomentDate;

    return (
      <DateTimePickerModal
        isVisible={show}
        // locale="en_GB"
        date={mode == 'time' ? new Date() : new Date(inputDate)}
        mode={mode}
        format={getFormat('date')}
        // is24Hour={}
        // maximumDate={maxDate}
        // minimumDate={new Date}
        onConfirm={onChange}
        onCancel={() => {
          setShow(false);
        }}
      />
    );
  }

  const displayValue = () => {
    if (mode === 'time') {
      return moment(value, getFormat('timeA')).format(getFormat('timeA'));
    } else {
      return moment(value, getFormat(valueFormat)).format(
        getFormat(labelFormat),
      );
    }
  };

  return (
    <View style={[styles.root, style]}>
      <TouchableOpacity
        // activeOpacity={0.7}
        onPress={showMode}
        style={[
          styles.inputWrapper(showError),
          disabled && styles.disabled,
          cStyle,
        ]}>
        {!_.isEmpty(value) ? (
          <Text style={[Typography.formLabel, textInputStyle]}>
            {displayValue()}
          </Text>
        ) : (
          <Text style={[Typography.formLabel, styles.placeholder]}>
            {placeholder || 'HH:MM'}
          </Text>
        )}
        <View style={styles.iconBox}></View>

        {renderDatePicker()}
      </TouchableOpacity>
      {showError ? <CErrorLog msg={errorMsg} /> : null}
    </View>
  );
});
export default CDateTimePicker;
CDateTimePicker.propTypes = {
  onDateChange: PropTypes.func,
  placeholder: PropTypes.string,
  errorMsg: PropTypes.string,
  value: PropTypes.any,
};

CDateTimePicker.defaultProps = {
  value: new Date(),
  onDateChange: () => {},
  placeholder: '',
  errorMsg: '',
};
