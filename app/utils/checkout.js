// One entry point for paying anything: startCheckout({kind, id, title, amount, ...}) opens the Review & pay sheet
// (components/CheckoutSheet, mounted once in the navigation stack).
const subs = new Set();
export const subscribeCheckout = fn => {
  subs.add(fn);
  return () => subs.delete(fn);
};

// kind -> server paths. `id` is the item id (for a deposit: the deposit's own id); the deposit's initiate/receipt
// routes are keyed by outlet (prId).
export const KIND = {
  bill: {
    label: 'Monthly rent',
    initiate: i => `client/bills/initiate-payment/${i.id}`,
    success: 'client/bills/easebuzz/success',
    failure: 'client/bills/easebuzz/failure',
    receipt: i => `client/receipt/${i.id}`,
  },
  additional_charge: {
    label: 'Extra charge',
    initiate: i => `client/additional-charges/initiate-payment/${i.id}`,
    success: 'client/additional-charges/easebuzz/success',
    failure: 'client/additional-charges/easebuzz/failure',
    receipt: i => `client/additional-charges/receipt/${i.id}`,
  },
  container_charge: {
    label: 'Container charge',
    initiate: i => `client/container-charges/initiate-payment/${i.id}`,
    success: 'client/container-charges/easebuzz/success',
    failure: 'client/container-charges/easebuzz/failure',
    receipt: i => `client/container-charges/receipt/${i.id}`,
  },
  deposit: {
    label: 'Security deposit',
    initiate: i => `client/security-deposit/initiate-payment/${i.prId}`,
    success: 'client/security-deposit/easebuzz/success',
    failure: 'client/security-deposit/easebuzz/failure',
    receipt: i => `client/security-deposit/receipt/${i.prId}`,
  },
};

export const startCheckout = item => {
  if (!item || !KIND[item.kind]) {
    return;
  }
  subs.forEach(fn => fn(item));
};
