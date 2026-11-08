import BaseSetting from '@config/setting';
import {store} from '@redux/store/configureStore';

// GET against the PRASH API with the logged-in tenant's token. (The fetch layer in utils/session
// refreshes an expiring token and retries once on a token error.)
export async function apiGet(path) {
  const token = store.getState().auth.accessToken;
  const res = await fetch(BaseSetting.baseUrl + path, {
    method: 'GET',
    headers: {Accept: '*/*', Authorization: 'Bearer ' + token},
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {}
  return {ok: res.ok, status: res.status, data};
}
