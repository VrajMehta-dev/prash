import React from 'react';
import {
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import _ from 'lodash';
import MaterialCommunityIcons from 'react-native-vector-icons/Octicons';
import New from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import styles from './styles';
import {BaseColors} from '@config/theme';

const CChatInput = props => {
  const {
    value = '',
    onChangeText = () => {},
    onSubmitEditing = () => {},
    onPressEmoji = () => {},
    onSend = () => {},
    onAttachClick = () => {},
  } = props;

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={{alignItems: 'center', justifyContent: 'center', right: 5}}
        activeOpacity={0.7}
        onPress={onAttachClick}>
        <New
          name="attach-file"
          size={24}
          color={BaseColors.black}
          style={styles.smileIcon}
        />
      </TouchableOpacity>
      <View style={styles.textInputOfChat}>
        <TextInput
          style={styles.txtSty}
          placeholder="Type message..."
          placeholderTextColor={BaseColors.darkGrey}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
        />
        <TouchableOpacity activeOpacity={0.7} onPress={onPressEmoji}>
          <SimpleLineIcons
            name="emotsmile"
            size={24}
            color={BaseColors.black}
            style={styles.smileIcon}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.sendButton, value?.trim() === '' && {opacity: 0.6}]}
        disabled={value?.trim() === ''}
        onPress={onSend}>
        <MaterialCommunityIcons
          name="paper-airplane"
          size={22}
          color={'white'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CChatInput;
