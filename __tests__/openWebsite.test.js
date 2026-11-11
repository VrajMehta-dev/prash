jest.mock('react-native', () => ({Linking: {openURL: jest.fn()}, Platform: {OS: 'android'}}));
jest.mock('react-native-device-info', () => ({__esModule: true, default: {getVersion: () => '1.2.6'}}));
jest.mock('@redux/store/configureStore', () => ({store: {getState: () => ({auth: {userData: {tenant_id: 118}}})}}));
const {trackedUrl} = require('../app/utils/openWebsite');

test('adds UTM tags, app version and tenant id; keeps existing query and hash', () => {
  const a = trackedUrl('https://aystera.com/products/x', 'help_about_prash');
  expect(a).toBe('https://aystera.com/products/x?utm_source=prash_app&utm_medium=mobile_app&utm_campaign=help_about_prash&utm_content=android&app_version=1.2.6&tenant_id=118');
  const b = trackedUrl('https://aystera.com/?a=1#top', 'profile_footer');
  expect(b.startsWith('https://aystera.com/?a=1&utm_source=prash_app')).toBe(true);
  expect(b.endsWith('#top')).toBe(true);
});
