import React, {useState} from 'react';
import {Text, View} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import {useTheme} from '@react-navigation/native';
import PropTypes from 'prop-types';
import moment from 'moment';
import {CustomIcon} from '@config/LoadIcons';
import {translate} from '@lang/Translate';
import GetStyles from './styles';

const CNotification = props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;

  // Destructuring props to extract values
  const {
    onPress = () => {},
    style = {},
    isUnread = false,
    title = '',
    date = '',
    message = '',
    isDay = false,
  } = props;

  // State Variables
  const [expanded, setExpanded] = useState(false);
  const [isMore, setIsMore] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return isDay ? (
    <Text style={[styles.titleText]}>{date}</Text>
  ) : (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.cardStyle, style]}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          {isUnread && <View style={styles.unReadContainer} />}
          <CustomIcon name="Notification" style={styles.notificationIcon} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.time(isUnread)}>
              {moment(date).format('hh:mm A')}
            </Text>
          </View>
          <Text
            style={styles.message}
            onTextLayout={e => {
              // Check if the number of lines exceeds the specified maxLines
              const {lines} = e.nativeEvent;
              if (isMore) {
              } else {
                setIsMore(lines.length > 1);
              }
            }}
            numberOfLines={isMore && !expanded ? 1 : null}>
            {message}
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={toggleExpanded}>
            {isMore ? (
              <Text style={[styles.readMoreText]}>
                {translate(expanded ? 'readLess' : 'readMore')}
              </Text>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

CNotification.propTypes = {
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  isUnread: PropTypes.bool,
  title: PropTypes.string,
  date: PropTypes.string,
  message: PropTypes.string,
  isDay: PropTypes.bool,
};

export default CNotification;
