// Payment-related logic of the app that does not need a device: the dues rows, the server routes per payment kind,
// the checkout entry point, the "Check status" mapping and the refresh events.
jest.mock('@utils/authedApi', () => ({apiGet: jest.fn()}));
jest.mock('@react-navigation/native', () => ({useFocusEffect: jest.fn()}));
jest.mock('react-redux', () => ({useSelector: jest.fn()}));
const {apiGet} = require('@utils/authedApi');
const {dueRowProps} = require('../app/utils/usePaymentQueue');
const {KIND, startCheckout, subscribeCheckout, checkPaymentStatus} = require('../app/utils/checkout');
const {onPaymentChange, emitPaymentChange} = require('../app/utils/paymentEvents');

describe('dueRowProps', () => {
  const item = (type, extra = {}) => ({type, id: 7, title: 'T', amount: 100, ...extra});
  test.each([
    ['deposit', 'Security deposit'],
    ['container_charge', 'Container charge'],
    ['additional_charge', 'Extra charge'],
    ['bill', 'Monthly rent'],
  ])('%s row says "%s" and carries its checkout item', (type, sub) => {
    const p = dueRowProps(item(type), 160);
    expect(p.sub).toBe(sub);
    expect(p.checkout).toMatchObject({kind: type, id: 7, amount: 100, prId: 160});
  });
  test('only the security deposit is highlighted', () => {
    expect(dueRowProps(item('deposit'), 1).highlight).toBe(true);
    expect(dueRowProps(item('bill'), 1).highlight).toBe(false);
  });
  test('a blocked item shows what must be paid first', () => {
    expect(dueRowProps(item('bill', {blocked_by: {title: 'Security deposit'}}), 1).blockedBy).toBe('Security deposit');
    expect(dueRowProps(item('bill'), 1).blockedBy).toBeUndefined();
  });
  test('a payment being confirmed is passed through', () => {
    expect(dueRowProps(item('bill', {payment_pending: {retry_after_seconds: 9}}), 1).pending).toEqual({retry_after_seconds: 9});
  });
});

describe('checkout routes', () => {
  test('rent / extra / container use the item id', () => {
    expect(KIND.bill.initiate({id: 5})).toBe('client/bills/initiate-payment/5');
    expect(KIND.additional_charge.initiate({id: 5})).toBe('client/additional-charges/initiate-payment/5');
    expect(KIND.container_charge.initiate({id: 5})).toBe('client/container-charges/initiate-payment/5');
  });
  test('the security deposit is keyed by outlet, not by deposit id', () => {
    expect(KIND.deposit.initiate({id: 5, prId: 160})).toBe('client/security-deposit/initiate-payment/160');
    expect(KIND.deposit.receipt({id: 5, prId: 160})).toBe('client/security-deposit/receipt/160');
  });
  test('every kind has success, failure and receipt routes', () => {
    for (const k of Object.values(KIND)) { expect(k.success).toMatch(/easebuzz\/success$/); expect(k.failure).toMatch(/easebuzz\/failure$/); expect(typeof k.receipt({id: 1, prId: 1})).toBe('string'); }
  });
});

describe('startCheckout', () => {
  test('opens the sheet for a known kind', () => {
    const fn = jest.fn(); const off = subscribeCheckout(fn);
    startCheckout({kind: 'bill', id: 1, amount: 10}); expect(fn).toHaveBeenCalledWith({kind: 'bill', id: 1, amount: 10}); off();
  });
  test('ignores an unknown kind and a missing item', () => {
    const fn = jest.fn(); const off = subscribeCheckout(fn);
    startCheckout({kind: 'nope'}); startCheckout(null); expect(fn).not.toHaveBeenCalled(); off();
  });
});

describe('checkPaymentStatus', () => {
  const refresh = jest.fn();
  beforeEach(() => { apiGet.mockReset(); refresh.mockReset(); });
  const run = async res => { apiGet.mockResolvedValue(res); const off = onPaymentChange(refresh); const r = await checkPaymentStatus({kind: 'bill', id: 3}); off(); return r; };
  test('paid', async () => { expect(await run({ok: true, data: {paid: true}})).toBe('paid'); expect(refresh).toHaveBeenCalled(); });
  test('failed', async () => expect(await run({ok: true, data: {paid: false, last_attempt: 'failed'}})).toBe('failed'));
  test('still pending', async () => expect(await run({ok: true, data: {paid: false}})).toBe('pending'));
  test('server error counts as pending (never as paid)', async () => expect(await run({ok: false})).toBe('pending'));
  test('asks the status route of that item', async () => { await run({ok: true, data: {}}); expect(apiGet).toHaveBeenCalledWith('client/payments/status/bill/3', 8000); });
});

describe('payment events', () => {
  test('subscribers are called and can unsubscribe', () => {
    const a = jest.fn(); const off = onPaymentChange(a);
    emitPaymentChange(); expect(a).toHaveBeenCalledTimes(1);
    off(); emitPaymentChange(); expect(a).toHaveBeenCalledTimes(1);
  });
});
