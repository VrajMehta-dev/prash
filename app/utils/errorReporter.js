import {AppState, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import BaseSetting from '@config/setting';
import {store} from '@redux/store/configureStore';
import {navigationRef} from '../navigation/NavigationService';
import {hotUpdater} from '@utils/hotUpdater';

// Sends the errors the app hits (a render error behind the "Something went wrong" screen, a fatal JS error) to the backend
// (POST client/app-logs, table app_error_logs, admin: GET /admin/app-logs) so a crash on someone's phone can be traced.
// Entries are queued on the phone first and sent when there is a connection: nothing is lost if the app is closed or offline.
// No emails / names / tokens are sent: the tenant's internal id, the app + bundle version, the screen and the error text.
const KEY = 'errlog:v1';
const MAX_QUEUE = 30;
let queue = null;
let flushing = false;
let lastKey = '';
let lastAt = 0;

const load = async () => {
  if (queue) return queue;
  try {
    queue = JSON.parse((await AsyncStorage.getItem(KEY)) || '[]');
  } catch (e) {
    queue = [];
  }
  return queue;
};
const save = async () => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
  } catch (e) {}
};

const deviceInfo = () => {
  let bundle = null;
  try {
    bundle = hotUpdater?.getBundleId?.() ?? null;
  } catch (e) {}
  let deviceId = null;
  try {
    deviceId = DeviceInfo.getUniqueIdSync?.() ?? null;
  } catch (e) {}
  return {
    device_id: deviceId,
    platform: Platform.OS,
    os_version: String(Platform.Version),
    app_version: DeviceInfo.getVersion(),
    build: DeviceInfo.getBuildNumber(),
    bundle_id: bundle,
    tenant_id: store.getState().auth?.userData?.tenant_id ?? null,
  };
};

export async function flushErrors() {
  if (flushing) return;
  flushing = true;
  try {
    const q = await load();
    if (!q.length) return;
    const batch = q.slice(0, 20);
    const res = await fetch(BaseSetting.baseUrl + 'client/app-logs', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({device: deviceInfo(), entries: batch}),
    });
    if (res.ok) {
      queue = q.slice(batch.length);
      await save();
    }
  } catch (e) {
    // offline or server down: stays queued for the next launch / foreground
  } finally {
    flushing = false;
  }
}

export async function reportError(kind, error, extra) {
  try {
    const message = String(error?.message ?? error ?? '').slice(0, 1000);
    const key = `${kind}:${message}`;
    const now = Date.now();
    if (key === lastKey && now - lastAt < 30000) return; // the same error repeating is one report
    lastKey = key;
    lastAt = now;
    const q = await load();
    q.push({
      kind,
      message,
      stack: String(error?.stack ?? '').slice(0, 6000),
      screen: navigationRef.current?.getCurrentRoute?.()?.name ?? null,
      ts: new Date(now).toISOString(),
      extra: extra || null,
    });
    await save();
    setTimeout(flushErrors, 1500);
  } catch (e) {}
}

let installed = false;
export function installErrorReporting() {
  if (installed) return;
  installed = true;
  try {
    const prev = global.ErrorUtils?.getGlobalHandler?.();
    global.ErrorUtils?.setGlobalHandler?.((e, isFatal) => {
      reportError(isFatal ? 'fatal_js' : 'js_error', e);
      prev && prev(e, isFatal);
    });
  } catch (e) {}
  AppState.addEventListener('change', s => s === 'active' && flushErrors());
  setTimeout(flushErrors, 8000); // anything left from an earlier launch
}
