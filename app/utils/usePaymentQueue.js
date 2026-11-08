import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {apiGet} from '@utils/authedApi';

// Everything owed for the selected outlet, in the order the server requires it to be paid:
// security deposit > container charges > extra charges > rent (oldest first). Only the first
// item is payable; each later one carries `blocked_by`. Refetches whenever the screen is focused.
export function usePaymentQueue() {
  const pr_id = useSelector(s => s.auth.shopSelected?.pr_id);
  const [items, setItems] = useState(null); // null = loading
  const reload = useCallback(async () => {
    if (!pr_id) {
      setItems([]);
      return;
    }
    try {
      const r = await apiGet(`client/payment-queue/${pr_id}`);
      if (r.ok) setItems(r.data.items || []);
    } catch (e) {}
  }, [pr_id]);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );
  // Title of the item that must be paid before (type, id), or undefined when it can be paid now.
  const blockedOf = (type, id) => items?.find(i => i.type === type && i.id === Number(id))?.blocked_by?.title;
  return {items, pr_id, reload, blockedOf};
}

const KIND = {
  deposit: {icon: 'lock-outline', sub: 'Security deposit', path: (i, pr) => `client/security-deposit/initiate-payment/${pr}`},
  container_charge: {icon: 'package-variant-closed', sub: 'Container charge', path: i => `client/container-charges/initiate-payment/${i.id}`},
  additional_charge: {icon: 'plus-circle-outline', sub: 'Extra charge', path: i => `client/additional-charges/initiate-payment/${i.id}`},
  bill: {icon: 'calendar-month-outline', sub: 'Monthly rent', path: i => `client/bills/initiate-payment/${i.id}`},
};

// Props for <DueRow/> from a queue item.
export const dueRowProps = (item, pr_id) => ({
  icon: KIND[item.type].icon,
  title: item.title,
  sub: KIND[item.type].sub,
  amount: item.amount,
  payPath: KIND[item.type].path(item, pr_id),
  blockedBy: item.blocked_by?.title,
  highlight: item.type === 'deposit',
});
