import React from 'react';
import {Keyboard, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {GetTypography} from '@config/theme';
import Icon, {Icons} from '@config/Icons';
import GetStyles from './styles';

const CHeader = props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const Typography = GetTypography();
  const BaseColors = colors;
  const {
    hideBackBtn = false,
    onBackPress = () => {},
    title = '',
    titleStyle = {},
    mainContainerStyle = {},
    leftViewStyle = {},
    isDrawer,
    onDrawerPress = () => {},
    isRightSideIcon = false,
    rightViewStyle = {},
    isRightSideText = false,
    rightDisabled = false,
    rightText = '',
    onRightPress = () => {},
    rightIconType = Icons.Octicons,
    rightIconName = 'bell',
    rightIconStyle = {},
  } = props;

  return (
    <View style={[styles.root, mainContainerStyle]}>
      <StatusBar
        translucent
        backgroundColor={'#0000'}
        barStyle="dark-content"
      />
      <View style={[styles.leftContainer, leftViewStyle]}>
        {isDrawer ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.iconContainer]}
            onPress={() => {
              Keyboard.dismiss();
              onDrawerPress();
            }}>
            <Icon type={Icons.Feather} name="menu" style={styles.drawerIcon} />
          </TouchableOpacity>
        ) : !hideBackBtn ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.iconContainer]}
            onPress={() => {
              Keyboard.dismiss();
              onBackPress();
            }}>
            <Icon
              type={Icons.Octicons}
              name={'chevron-left'}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.emptyLeftIconContainer]} />
        )}
      </View>
      <View
        style={[
          styles.centerContainer,
          isRightSideText && {paddingLeft: 15},
          titleStyle,
        ]}>
        <Text
          style={[Typography.pageTitle, {color: BaseColors.textColor}]}
          numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={[styles.rightContainer, rightViewStyle]}>
        {isRightSideIcon ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.iconContainer]}
            onPress={() => {
              Keyboard.dismiss();
              onRightPress();
            }}>
            <Icon
              type={rightIconType}
              name={rightIconName}
              style={[styles.notificationIcon, rightIconStyle]}
            />
          </TouchableOpacity>
        ) : isRightSideText ? (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={rightDisabled}
            style={[styles.iconContainer1, rightDisabled && styles.disabled]}
            onPress={() => {
              Keyboard.dismiss();
              onRightPress();
            }}>
            <Text style={styles.clearSty}>{rightText}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.emptyLeftIconContainer]} />
        )}
      </View>
    </View>
  );
};

export default CHeader;
