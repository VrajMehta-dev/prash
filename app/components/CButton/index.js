/* eslint-disable react/react-in-jsx-scope */
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import propTypes from 'prop-types';
import {useTheme} from '@react-navigation/native';
import {GetTypography} from '@config/theme';
import {CustomIcon} from '@config/LoadIcons';
import GetStyles from './styles';

const CButton = props => {
  const {
    label = '',
    loading = false,
    disabled = false,
    onPress = () => {},
    outLineBtn = false,
    whiteBgBtn = false,
    btnStyle = {},
    textStyle = {},
    loginBtn = false,
    linkBtn = false,
    icon,
    iconName,
    iconStyle = {},
    loaderStyle = {},
    children,
    textBtn = false,
  } = props;

  const Typography = GetTypography();
  const {colors} = useTheme();
  const BaseColors = colors;
  const styles = GetStyles();
  return (
    <>
      {outLineBtn ? (
        <TouchableOpacity
          disabled={disabled}
          activeOpacity={0.7}
          onPress={onPress}
          style={[
            styles.outLineBtnContainer,
            disabled && {opacity: 0.6},
            btnStyle,
          ]}>
          {loading ? (
            <ActivityIndicator color={BaseColors.primary} size={24} />
          ) : (
            <View style={styles.row}>
              {iconName && (
                <CustomIcon
                  name={iconName}
                  style={[styles.whiteBtnIcon, iconStyle]}
                />
              )}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  Typography.buttomLabel,
                  {color: BaseColors.primary},
                  textStyle,
                ]}>
                {label}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ) : whiteBgBtn ? (
        <TouchableOpacity
          disabled={disabled}
          activeOpacity={0.7}
          onPress={onPress}
          style={[
            styles.whiteBtnContainer,
            disabled && {opacity: 0.6},
            btnStyle,
          ]}>
          {loading ? (
            <ActivityIndicator color={BaseColors.primary} size={24} />
          ) : (
            <View style={styles.row}>
              {iconName && (
                <CustomIcon
                  name={iconName}
                  style={[styles.whiteBtnIcon, iconStyle]}
                />
              )}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  Typography.buttomLabel,
                  {color: BaseColors.primary},
                  textStyle,
                ]}>
                {label}
              </Text>
              {children}
            </View>
          )}
        </TouchableOpacity>
      ) : textBtn ? (
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={loading}
          onPress={onPress}
          style={styles.row}>
          <Text style={styles.textBtnText}>{label}</Text>
          {iconName && (
            <CustomIcon name={iconName} style={[{marginLeft: 10}, iconStyle]} />
          )}
        </TouchableOpacity>
      ) : linkBtn ? (
        <TouchableOpacity
          disabled={disabled}
          activeOpacity={0.7}
          onPress={onPress}
          style={[
            styles.linkBtnContainer,
            disabled && {opacity: 0.6},
            btnStyle,
          ]}>
          {loading ? (
            <ActivityIndicator color={BaseColors.primary} size={24} />
          ) : (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[Typography.buttomLabel, styles.linkBtnText, textStyle]}>
              {label}
            </Text>
          )}
        </TouchableOpacity>
      ) : loginBtn ? (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.loginBtnContainer,
            disabled && {opacity: 0.6},
            btnStyle,
          ]}
          disabled={disabled}
          onPress={onPress}>
          {loading ? (
            <ActivityIndicator size={20} color={BaseColors.primary} />
          ) : (
            <View style={styles.logoAndLabelContainer}>
              <View style={styles.iconContainer}>{icon}</View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.loginBtnLabelText}>
                {label}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          disabled={disabled}
          activeOpacity={0.75}
          onPress={disabled ? null : onPress}
          style={[styles.fillBtn, {opacity: disabled ? 0.7 : 1}, btnStyle]}>
          {loading ? (
            <ActivityIndicator color={'white'} size={28} style={loaderStyle} />
          ) : (
            <View style={styles.row}>
              {iconName && (
                <CustomIcon
                  name={iconName}
                  style={[{color: BaseColors.white}, iconStyle]}
                />
              )}
              {label && (
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    Typography.buttomLabel,
                    {
                      color: BaseColors.buttonLabel,
                      textAlign: 'center',
                    },
                    textStyle,
                  ]}>
                  {label}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}
    </>
  );
};

CButton.propTypes = {
  label: propTypes.string,
  loading: propTypes.bool,
  disabled: propTypes.bool,
  onPress: propTypes.func,
  outLineBtn: propTypes.bool,
  whiteBgBtn: propTypes.bool,
  linkBtn: propTypes.bool,
  loginBtn: propTypes.bool,
  btnStyle: propTypes.oneOfType([propTypes.object, propTypes.array]),
  textStyle: propTypes.oneOfType([propTypes.object, propTypes.array]),
};

export default CButton;
