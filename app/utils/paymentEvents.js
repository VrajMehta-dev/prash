// Tiny pub-sub: anything that shows dues (Home, Pay, Rent, Extras, Containers, Deposit) refreshes when a payment settles.
const subs = new Set();
export const onPaymentChange = fn => {
  subs.add(fn);
  return () => subs.delete(fn);
};
export const emitPaymentChange = () => subs.forEach(fn => fn());
