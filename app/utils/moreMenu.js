import {useEffect, useState} from 'react';

// Tiny shared state for the "More" menu: the bottom bar hides while it is open, the overlay (components/MoreMenu) shows it.
let isOpen = false;
const subs = new Set();
const set = v => {
  if (isOpen === v) return;
  isOpen = v;
  subs.forEach(fn => fn(v));
};
export const openMore = () => set(true);
export const closeMore = () => set(false);
export const useMoreOpen = () => {
  const [v, setV] = useState(isOpen);
  useEffect(() => {
    subs.add(setV);
    setV(isOpen);
    return () => subs.delete(setV);
  }, []);
  return v;
};
