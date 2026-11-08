import {HotUpdater} from '@hot-updater/react-native';
import BaseSetting from '@config/setting';

const {ota} = BaseSetting;

// Resolves once the SDK has finished verifying this launch (a freshly applied bundle is "pending"
// until then). Checking for updates before that point makes the SDK offer the bundle we just applied.
let markLaunchSettled;
export const launchSettled = new Promise(resolve => {
  markLaunchSettled = resolve;
});

// The OTA client for this build (null when OTA isn't configured, e.g. prod for now).
// Updates are NOT downloaded silently: components/OtaUpdatePrompt asks the user first.
export const hotUpdater = ota
  ? HotUpdater.init({
      baseURL: ota.baseURL,
      requestHeaders: {'x-api-key': ota.apiKey},
      onNotifyAppReady: () => markLaunchSettled(),
      onError: e => {
        console.log('[ota]', e);
        markLaunchSettled();
      },
    })
  : null;
