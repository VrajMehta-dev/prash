import {useEffect, useState} from 'react';
import {AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseSetting from '@config/setting';

// The festival the backend says is on today (IST), or null. The backend decides from its festival
// calendar, so a new festival needs no app release. Cached so it still shows offline and on a slow start.
const KEY = 'festival:v1';
let current = null;
const subs = new Set();
const set = f => {
  current = f;
  subs.forEach(fn => fn(f));
};

const todayIST = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

let loadedCache = false;
async function readCache() {
  if (loadedCache) return;
  loadedCache = true;
  try {
    const f = JSON.parse((await AsyncStorage.getItem(KEY)) || 'null');
    if (f && f.ends_on >= todayIST() && !current) set(f); // an expired cache must not linger
  } catch (e) {}
}

export async function refreshFestival() {
  try {
    const res = await fetch(BaseSetting.baseUrl + 'client/app-theme', {headers: {Accept: 'application/json'}});
    if (!res.ok) return;
    const f = (await res.json())?.festival || null;
    set(f);
    AsyncStorage.setItem(KEY, JSON.stringify(f)).catch(() => {});
  } catch (e) {} // offline: keep whatever we have
}

export function useFestival() {
  const [f, setF] = useState(current);
  useEffect(() => {
    subs.add(setF);
    readCache().then(refreshFestival);
    const sub = AppState.addEventListener('change', s => s === 'active' && refreshFestival());
    return () => {
      subs.delete(setF);
      sub.remove();
    };
  }, []);
  return f;
}
