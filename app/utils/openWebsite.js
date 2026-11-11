import {Linking, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {store} from '@redux/store/configureStore';

// Opening our website from the app: tag the link with UTM parameters so Google Analytics on the website records the visit as
// coming from the PRASH app (Acquisition > source "prash_app" / medium "mobile_app", campaign = where in the app it was tapped).
// `tenant_id` (an internal number, no name/email/phone) lets the website side map a visit to a tenant; on the website set it as the GA4
// user_id / a custom dimension. (A native in-app analytics SDK would need a store release; this needs none.)
export function trackedUrl(url, campaign) {
  let tenantId = '';
  try {
    tenantId = String(store.getState().auth?.userData?.tenant_id ?? '');
  } catch (e) {
    // store not ready: the link still opens, just without the tenant
  }
  const hashAt = url.indexOf('#');
  const base = hashAt === -1 ? url : url.slice(0, hashAt);
  const hash = hashAt === -1 ? '' : url.slice(hashAt);
  const params = [
    ['utm_source', 'prash_app'],
    ['utm_medium', 'mobile_app'],
    ['utm_campaign', campaign || 'app'],
    ['utm_content', Platform.OS],
    ['app_version', DeviceInfo.getVersion()],
    ...(tenantId ? [['tenant_id', tenantId]] : []),
  ]
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `${base}${base.includes('?') ? '&' : '?'}${params}${hash}`;
}

export const openWebsite = (url, campaign) => Linking.openURL(trackedUrl(url, campaign));
