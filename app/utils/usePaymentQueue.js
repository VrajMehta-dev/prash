import {useCallback, useEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {apiGet} from '@utils/authedApi';
import {onPaymentChange} from '@utils/paymentEvents';

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
  useEffect(() => onPaymentChange(reload), [reload]);
  // Title of the item that must be paid before (type, id), or undefined when it can be paid now.
  const blockedOf = (type, id) => items?.find(i => i.type === type && i.id === Number(id))?.blocked_by?.title;
  return {items, pr_id, reload, blockedOf};
}

const KIND = {
  deposit: {icon: 'lock-closed-outline', sub: 'Security deposit'},
  container_charge: {icon: 'cube-outline', sub: 'Container charge'},
  additional_charge: {icon: 'layers-outline', sub: 'Extra charge'},
  bill: {icon: 'receipt-outline', sub: 'Monthly rent'},
};

// Props for <DueRow/> from a queue item.
export const dueRowProps = (item, pr_id) => ({
  icon: KIND[item.type].icon,
  title: item.title,
  sub: KIND[item.type].sub,
  amount: item.amount,
  checkout: {kind: item.type, id: item.id, title: item.title, subtitle: KIND[item.type].sub, amount: item.amount, prId: pr_id},
  blockedBy: item.blocked_by?.title,
  pending: item.payment_pending,
  highlight: item.type === 'deposit',
});
