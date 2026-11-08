import BaseSetting from '@config/setting';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  RefreshControl
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/Ionicons';
import ionGlyphs from 'react-native-vector-icons/glyphmaps/Ionicons.json';
import {useSelector} from 'react-redux';
import {useNavigation, useIsFocused} from '@react-navigation/native';

// Never render a blank / "?" glyph: an icon name must exist in the icon font, otherwise use the bell.
const FALLBACK_ICON = 'notifications';
const safeIcon = name => (name && ionGlyphs[name] ? name : FALLBACK_ICON);

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const {accessToken} = useSelector(state => state.auth);
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(1);
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchNotifications();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const url = BaseSetting.baseUrl + BaseSetting.endpoints.notiList;
    const headers = {
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };

    try {
      const response = await fetch(url, {method: 'GET', headers});
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('data=====>', data);

      if (response.ok) {
        setNotifications(data?.data);
      } else {
        console.log('Error fetching notifications:', data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const readNoti = async notifyIds => {
    const url = BaseSetting.baseUrl + BaseSetting.endpoints.readNoti;
    const headers = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
    };

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({notify_ids: notifyIds}),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        updateLocalReadStatus(notifyIds);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const updateLocalReadStatus = notifyIds => {
    setNotifications(
      notifications.map(notification =>
        notifyIds.includes(notification.notify_id)
          ? {...notification, read: true}
          : notification,
      ),
    );
  };

  const markAsRead = notifyId => readNoti([notifyId]);
  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter(notification => notification.read === false)
      .map(notification => notification.notify_id);
    if (unreadIds.length > 0) {
      readNoti(unreadIds);
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    return (
      date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) +
      ', ' +
      date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    );
  };

  // The category of a notification (the server derives it from the title when none was stored).
  const kindOf = item =>
    String(item?.type || item?.data?.type || item?.category || 'general').toLowerCase();

  // One look per category: [icon, accent colour, tinted background].
  const LOOKS = [
    // order matters: failure / unpaid before paid, deposit before the generic charge kinds
    [k => k.includes('fail'), 'close-circle', '#C0392B', '#FBE4E1'],
    [k => k.includes('security_deposit'), 'shield-checkmark', '#7A3E9D', '#F1E6F8'],
    [k => k.includes('unpaid'), 'alert-circle', '#B45309', '#FFF1D6'],
    [k => k.includes('penalty') || k.includes('overdue'), 'warning', '#B45309', '#FFF1D6'],
    [k => k.includes('paid') || k.includes('success'), 'checkmark-circle', '#1E7B4B', '#DDF5E7'],
    [k => k.includes('due_today'), 'alarm', '#C0392B', '#FBE4E1'],
    [k => k.includes('due'), 'time', '#B45309', '#FFF1D6'],
    [k => k.includes('bill_generation'), 'receipt', '#632240', '#F6EEF2'],
    [k => k.includes('bill'), 'document-text', '#632240', '#F6EEF2'],
    [k => k.includes('rent_start'), 'key', '#1E7B4B', '#DDF5E7'],
    [k => k.includes('rent_end'), 'calendar', '#B45309', '#FFF1D6'],
    [k => k.includes('container'), 'cube', '#0F766E', '#DDF3F0'],
    [k => k.includes('additional') || k.includes('charge'), 'layers', '#0F766E', '#DDF3F0'],
  ];
  const look = item => {
    const k = kindOf(item);
    const hit = LOOKS.find(l => l[0](k));
    // A server-sent data.icon wins if it is a real glyph; then the category icon; then the bell.
    const icon = safeIcon(ionGlyphs[item?.data?.icon] ? item.data.icon : hit?.[1]);
    return hit
      ? {icon, color: hit[2], bg: hit[3]}
      : {icon, color: '#632240', bg: '#F6EEF2'};
  };

  // Tapping opens what the notification is about.
  const open = item => {
    const k = kindOf(item);
    const screen = item?.data?.screen;
    if (screen) {
      navigation.navigate(screen);
    } else if (k.includes('security_deposit')) {
      navigation.navigate('SecurityDeposit');
    } else if (k.includes('container')) {
      navigation.navigate('Charges', {segment: 'container'});
    } else if (k.includes('additional') || k === 'charge_updated') {
      navigation.navigate('Charges', {segment: 'additional'});
    } else if (k.includes('payment') || k.includes('paid') || k.includes('bill') || k.includes('due') || k.includes('penalty') || k.includes('rent')) {
      navigation.navigate('Bills');
    }
  };

  const renderNotificationItem = ({item}) => {
    return (
      <Animated.View style={{opacity: fadeAnim}}>
        <TouchableOpacity
          style={[
            styles.notificationItem,
            item.read === false && styles.unreadItem,
          ]}
          onPress={() => {
            markAsRead(item.notify_id);
            open(item);
          }}>
          <View style={[styles.iconContainer, {backgroundColor: look(item).bg}]}>
            <Icon name={look(item).icon} size={22} color={look(item).color} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{item.title}</Text>
            {item.body && <Text style={styles.body}>{item.body}</Text>}
            <Text style={styles.time}>{formatDate(item.created_at)}</Text>
          </View>
          {item.read === false && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon name="hourglass-outline" size={60} color="#632240" />
            <Text style={styles.emptyText}>Loading notifications...</Text>
          </Animated.View>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon name="notifications-off-outline" size={60} color="#632240" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          {/* <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchNotifications}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity> */}
        </Animated.View>
      </View>
    );
  };

  const hasUnreadNotifications = notifications.some(
    item => item.read === false,
  );

  return (
    <SafeAreaView style={styles.container}>
      {isFocused && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#fff"
          showHideTransition="slide"
        />
      )}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {hasUnreadNotifications ? (
          <TouchableOpacity
            onPress={markAllAsRead}
            style={styles.backButton}
            accessibilityLabel="Mark all as read"
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="checkmark-done" size={24} color="#632240" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.notify_id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchNotifications}
            tintColor="#632240"
            colors={['#632240']}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#ffffff',
    marginTop: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllRead: {
    fontSize: 14,
    color: '#632240',
    padding: 4,
  },
  headerSpacer: {
    width: 32, // same width as the back button / mark-all icon so the title stays centred
  },
  listContainer: {
    padding: 12,
    paddingBottom: 24, // Added padding at the bottom
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  unreadItem: {
    backgroundColor: '#FBF5F8',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center', // Better vertical alignment
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#632240',
    marginLeft: 12,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#632240',
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#632240',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationScreen;
