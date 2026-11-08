import {HotUpdater} from '@hot-updater/react-native';
import BaseSetting from '@config/setting';

const {ota} = BaseSetting;

// Wraps the root component: checks for a JS bundle on launch, downloads it, and it
// takes effect on the next cold start. No-op when OTA is not configured (prod, for now).
export const withOta = ota
  ? HotUpdater.init({
      baseURL: ota.baseURL,
      requestHeaders: {'x-api-key': ota.apiKey},
      onError: e => console.log('[ota]', e),
    }).wrap({updateStrategy: 'appVersion'})
  : Component => Component;
