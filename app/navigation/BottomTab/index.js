import React, {useRef} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {useTheme} from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import Icon, {Icons} from '@config/Icons';
import GetStyles from './styles';
import {translate} from '@lang/Translate';
import {BaseColors} from '@config/theme';

export default function BottomTabBar({state, descriptors, navigation}) {
  const {colors} = useTheme();
  const styles = GetStyles();

  const homeTabRef = useRef();
  const chatTabRef = useRef();
  const additionalChargesTabRef = useRef();
  const profileTabRef = useRef();

  const iconAnimation = index => {
    if (index === 0) homeTabRef?.current.tada(1500);
    if (index === 1) chatTabRef?.current.tada(1500);
    if (index === 2) additionalChargesTabRef?.current.tada(1500);
    if (index === 3) profileTabRef?.current.tada(1500);
  };

  const getIcons = (label, isFocused, index) => {
    const tabIconColor = isFocused ? '#632240' : BaseColors.textGrey;
    const tabText = isFocused ? 'bold' : 'medium';

    const icons = {
      Dashboard: {
        type: Icons.Ionicons,
        name: isFocused ? 'home' : 'home-outline',
      },
      Bills: {
        type: Icons.Ionicons,
        name: isFocused ? 'newspaper' : 'newspaper-outline',
      },
      Charges: {
        type: Icons.Ionicons,
        name: isFocused ? 'cash' : 'cash-outline',
      },
      Profile: {type: Icons.FontAwesome, name: isFocused ? 'user' : 'user-o'},
      
    };

    return (
      <>
        <Animatable.View
          style={styles.iconContainer}
          ref={
            index === 0 ? homeTabRef : index === 1 ? chatTabRef : index === 2 ? additionalChargesTabRef : profileTabRef
          }>
          <Icon
            type={icons[label]?.type}
            name={icons[label]?.name}
            style={[styles.bottomTabIcons, {color: tabIconColor}]}
          />
        </Animatable.View>
        <Text
          style={[
            styles.bottomTabLabels,
            {color: tabIconColor, fontFamily: tabText},
          ]}>
          {translate(label)}
        </Text>
      </>
    );
  };

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          if (index > 3) return null; // Only allow 4 tabs

          const {options} = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            iconAnimation(index);
            if (!isFocused) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              onPress={onPress}
              style={[styles.tab, {flex: 1}]}>
              {getIcons(label, isFocused, index)}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
