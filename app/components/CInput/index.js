/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useTheme} from '@react-navigation/native';
import CountryPicker, {
  DARK_THEME,
  DEFAULT_THEME,
} from 'react-native-country-picker-modal';
import {useSelector} from 'react-redux';
import _ from 'lodash';
import CPopOver from '@components/CPopOver';
import CFlag from '@components/CFlag';
import CErrorLog from '@components/CErrorLog';
import {FontFamily, GetTypography} from '@config/theme';
import {CustomIcon} from '@config/LoadIcons';
import BaseSetting from '@config/setting';
import Icon, {Icons} from '@config/Icons';
import GetStyles from './styles';

// Remove font scale
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

const IOS = Platform.OS === 'ios';
const CInput = React.forwardRef((props, ref) => {
  const styles = GetStyles();
  const Typography = GetTypography();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {
    onSubmitEditing = () => {},
    placeholder = '',
    label = '',
    onChangeText = () => {},
    isLastInput,
    returnKeyType,
    textInputWrapper = {},
    autoCapitalize = 'sentences',
    secureTextEntry = false,
    infoIcon = false,
    infoLabel = '',
    leftIcon = false,
    customIconName = 'email',
    customIconStyle = {},
    rightIconStyle,
    editable = true,
    value = '',
    colorStyle = {},
    keyboardType = 'default',
    placeholderTextColor = BaseColors.thirdFontBlack,
    phoneInput = false,
    maxLength = 500,
    onPressIn = () => {},
    onBlur = () => {},
    onFocus = () => {},
    inputStyle = {},
    multiline = false,
    iconColor = BaseColors.secondary,
    showError = false,
    phoneCode = BaseSetting.phoneCode,
    countryCode = BaseSetting.countryCode,
    errorMsg = 'Error',
    inputViewStyle = {},
    mainLabelContainerStyle = {},
    labelTextStyle = {},
    onCountrySelect = () => {},
    blurOnSubmit = false,
    numberOfLines = 100,
    //Password validation message
    showPasswordValidation = false,

    required = false,
    mainContainerStyle = {},
    ...rest
  } = props;

  // Get value from Redux
  const {darkMode} = useSelector(state => state.auth);

  // State variables
  const [passwordVisible, setPasswordVisible] = useState(secureTextEntry);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [conditionsMet, setConditionsMet] = useState({
    hasNumber: false,
    hasUppercase: false,
    hasLowercase: false,
    hasSymbol: false,
    hasMinLength: false,
    hasAllMatch: false,
  });

  function handlePasswordChangeFunction(text) {
    setConditionsMet({
      hasNumber: /\d/.test(text),
      hasUppercase: /[A-Z]/.test(text),
      hasLowercase: /[a-z]/.test(text),
      hasSymbol: /^(?=.*[!@#$%+:^=<(){}[\]~>_?`|'";,.&*€₹£])/.test(text),
      hasMinLength: text.length >= 8,
      hasAllMatch: BaseSetting.passwordRegex.test(text),
    });
  }

  return (
    <View style={[{marginBottom: 15}, mainContainerStyle]}>
      {/* Label container here */}
      {label ? (
        <View style={[styles.labelMainContainer, mainLabelContainerStyle]}>
          <View style={styles.row}>
            <Text
              style={[Typography.formLabel, labelTextStyle, styles.labelText]}>
              {label}
            </Text>
            {required && (
              <Icon
                type={Icons.MaterialCommunityIcons}
                name="asterisk"
                style={styles.requiredIcon}
              />
            )}
          </View>
          {infoIcon && (
            <CPopOver
              from={
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPopover(true)}>
                  <CustomIcon name="info-Circle" style={styles.infoIcon} />
                </TouchableOpacity>
              }
              visible={showPopover}
              onRequestClose={() => setShowPopover(false)}>
              <Text style={styles.infoLabelText}>{infoLabel}</Text>
            </CPopOver>
          )}
        </View>
      ) : null}

      <View style={[styles.inputWrapper(showError), textInputWrapper]}>
        <View
          style={[
            multiline
              ? IOS
                ? {minHeight: 110, marginBottom: 10}
                : {height: 110, marginBottom: 10}
              : {height: 50},
            {
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 10,
            },
            !editable
              ? {
                  backgroundColor: BaseColors.grey,
                  opacity: 0.7,
                }
              : null,
            inputViewStyle,
          ]}>
          {phoneInput ? (
            <View style={[styles.countryPickerView]}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={!editable}
                onPress={() => setIsCountryPickerOpen(true)}
                style={styles.countryContainer}>
                <CFlag code={countryCode} size={20} />
                <Icon
                  type={Icons.Ionicons}
                  name="chevron-down"
                  style={styles.countryDownIcon}
                />
              </TouchableOpacity>
              <Text style={[styles.phoneCodeText(String(value).trim() !== '')]}>
                {phoneCode}
              </Text>
            </View>
          ) : null}
          <>
            {leftIcon && (
              <Icon
              type={Icons.FontAwesome6}
                name={leftIcon}
                size={20}
                color={BaseColors.mainFontBlack}
                style={[styles.leftIcon, customIconStyle]}
              />
            )}
            <TextInput
              {...rest}
              ref={ref}
              selectionColor={BaseColors.black50}
              placeholder={placeholder}
              autoCapitalize={autoCapitalize}
              // disabled={true}
              placeholderTextColor={placeholderTextColor}
              onFocus={onFocus}
              style={[
                styles.input,
                {
                  fontFamily: FontFamily.regular,
                },
                phoneInput && {paddingLeft: 5},
                multiline
                  ? {textAlignVertical: 'top', minHeight: 110, paddingTop: 8}
                  : {height: 50},
                inputStyle,
                !editable
                  ? {
                      backgroundColor: BaseColors.grey,
                      color: BaseColors.textColor,
                    }
                  : colorStyle,
              ]}
              scrollEnabled={multiline ? false : null}
              onChangeText={val => {
                handlePasswordChangeFunction(val);
                onChangeText(val);
              }}
              onBlur={onBlur}
              onPressIn={onPressIn}
              blurOnSubmit={blurOnSubmit}
              onSubmitEditing={onSubmitEditing}
              returnKeyType={returnKeyType || (isLastInput ? 'go' : 'next')}
              secureTextEntry={passwordVisible ? true : false}
              editable={editable}
              value={value}
              maxLength={maxLength}
              keyboardType={keyboardType}
              multiline={multiline}
              numberOfLines={numberOfLines}
            />
          </>
          {secureTextEntry && !_.isEmpty(value) ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                !_.isEmpty(value) ? setPasswordVisible(!passwordVisible) : null;
              }}>
              <Icon
                type={Icons.Feather}
                name={passwordVisible ? 'eye-off' : 'eye'}
                size={18}
                color={
                  iconColor || value ? BaseColors.primary : BaseColors.black
                }
                style={{marginEnd: 14}}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {showPasswordValidation &&
      conditionsMet?.hasAllMatch === false &&
      !_.isEmpty(value) ? (
        <View style={styles.conditionsContainer}>
          <Text
            style={[
              styles.conditionText,
              conditionsMet?.hasNumber && styles.green,
            ]}>
            Contains a number
          </Text>
          <Text
            style={[
              styles.conditionText,
              conditionsMet?.hasUppercase && styles.green,
            ]}>
            Contains an uppercase letter
          </Text>
          <Text
            style={[
              styles.conditionText,
              conditionsMet?.hasLowercase && styles.green,
            ]}>
            Contains a lowercase letter
          </Text>
          <Text
            style={[
              styles.conditionText,
              conditionsMet?.hasSymbol && styles.green,
            ]}>
            Contains a special character symbol
          </Text>
          <Text
            style={[
              styles.conditionText,
              conditionsMet?.hasMinLength && styles.green,
            ]}>
            Has at least 8 characters to 15 characters
          </Text>
        </View>
      ) : null}
      {showError ? <CErrorLog style={{marginTop: 5}} msg={errorMsg} /> : null}
      <CountryPicker
        withModal
        withFilter
        withAlphaFilter
        // disableNativeModal
        visible={isCountryPickerOpen}
        withCallingCode
        onClose={() => {
          setIsCountryPickerOpen(false);
        }}
        theme={darkMode ? DARK_THEME : DEFAULT_THEME}
        onSelect={val => {
          const phoneCode = `+${val.callingCode}`;
          const countryCode = val?.cca2;
          const flag = val?.flag;
          onCountrySelect(phoneCode, countryCode);
        }}
        // flatListProps={{
        //   fontFamily: FontFamily.default,
        // }}
        containerButtonStyle={{display: 'none'}}
      />
    </View>
  );
});

export default CInput;
