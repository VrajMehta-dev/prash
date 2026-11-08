import {HotUpdater} from '@hot-updater/react-native';
import BaseSetting from '@config/setting';

const {ota} = BaseSetting;

// The OTA client for this build (null when OTA isn't configured, e.g. prod for now).
// Updates are NOT downloaded silently: components/OtaUpdatePrompt asks the user first.
export const hotUpdater = ota
  ? HotUpdater.init({
      baseURL: ota.baseURL,
      requestHeaders: {'x-api-key': ota.apiKey},
      onError: e => console.log('[ota]', e),
    })
  : null;
