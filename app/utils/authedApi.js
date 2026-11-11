import BaseSetting from '@config/setting';
import {store} from '@redux/store/configureStore';

// GET against the PRASH API with the logged-in tenant's token. (The fetch layer in utils/session
// refreshes an expiring token and retries once on a token error.)
// `timeoutMs` (optional): give up and return {ok:false, status:0} instead of waiting forever on a stuck connection.
export async function apiGet(path, timeoutMs) {
  const token = store.getState().auth.accessToken;
  const ctrl = timeoutMs ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  let res;
  let text;
  try {
    res = await fetch(BaseSetting.baseUrl + path, {
      method: 'GET',
      headers: {Accept: '*/*', Authorization: 'Bearer ' + token},
      ...(ctrl ? {signal: ctrl.signal} : {}),
    });
    text = await res.text();
  } catch (e) {
    if (ctrl) {
      return {ok: false, status: 0, data: {}};
    }
    throw e;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {}
  return {ok: res.ok, status: res.status, data};
}
