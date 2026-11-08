import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {apiGet} from '@utils/authedApi';

// Number of unread notifications for the logged-in tenant (refreshed whenever the screen is focused).
export function useUnreadCount() {
  const [count, setCount] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      apiGet('client/notifications?limit=1')
        .then(r => alive && r.ok && setCount(Number(r.data?.unread_count || 0)))
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, []),
  );
  return count;
}
