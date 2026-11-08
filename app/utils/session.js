import {AppState} from 'react-native';
import {Buffer} from 'buffer';
import BaseSetting from '@config/setting';
import {store} from '@redux/store/configureStore';
import AuthAction from '@redux/reducers/auth/actions';
import {logout} from '@utils/commonFunction';

// Access tokens last 1 day, refresh tokens 7. The app used to drop the refresh token and force a
// re-login every day (leaving the server's push token active). This keeps the session alive:
//  - refresh shortly before the access token expires, and when the app returns to the foreground
//  - on a 401/403 token error, refresh once and retry the request
//  - only if the server rejects the refresh token do we log out (and clean up push tokens).
const SKEW_MS = 5 * 60 * 1000;
const rawFetch = global.fetch.bind(global);
let inflight = null;

const expMs = token => {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8')).exp * 1000;
  } catch (e) {
    return 0;
  }
};

export function refreshSession() {
  if (inflight) {
    return inflight;
  }
  inflight = (async () => {
    const {refreshToken} = store.getState().auth;
    if (!refreshToken) {
      return false;
    }
    try {
      const res = await rawFetch(BaseSetting.baseUrl + 'client/refresh', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refresh_token: refreshToken}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.accessToken) {
          await store.dispatch(AuthAction.setAccessToken(data.accessToken));
          return true;
        }
        return false;
      }
      if (res.status === 401 || res.status === 403) {
        // Refresh token rejected/expired: the session is really over.
        await logout(undefined, false, 'expired');
      }
      return false;
    } catch (e) {
      return false; // offline / server hiccup: keep the session, try again later
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export async function ensureFreshToken() {
  const {accessToken, refreshToken} = store.getState().auth;
  if (!accessToken || !refreshToken) {
    return;
  }
  if (expMs(accessToken) - Date.now() > SKEW_MS) {
    return;
  }
  await refreshSession();
}

const SKIP = /client\/(login|refresh|logout|request-password-reset|reset-password)/;

// Every authenticated API call made with fetch goes through here.
global.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url;
  const auth = init?.headers?.Authorization || init?.headers?.authorization;
  if (!url || !url.startsWith(BaseSetting.baseUrl) || SKIP.test(url) || !auth) {
    return rawFetch(input, init);
  }
  await ensureFreshToken();
  const withToken = () => {
    const token = store.getState().auth.accessToken;
    return token
      ? {...init, headers: {...init.headers, Authorization: 'Bearer ' + token}}
      : init;
  };
  let res = await rawFetch(input, withToken());
  if (res.status === 401 || res.status === 403) {
    const msg = await res
      .clone()
      .json()
      .then(j => j?.msg || '')
      .catch(() => '');
    if (/token/i.test(msg) && (await refreshSession())) {
      res = await rawFetch(input, withToken());
    }
  }
  return res;
};

AppState.addEventListener('change', state => {
  if (state === 'active') {
    ensureFreshToken();
  }
});
