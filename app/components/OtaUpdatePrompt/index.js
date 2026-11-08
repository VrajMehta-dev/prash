import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Modal, View, Text, StyleSheet, AppState, ActivityIndicator} from 'react-native';
import {useHotUpdaterStore} from '@hot-updater/react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableOpacity from '@components/PressableScale';
import {hotUpdater} from '@utils/hotUpdater';
import {Brand} from '@config/brand';

// Tells the user when a new version of the app's code is available, lets them download it, and
// asks them to restart to apply it. (Native/store updates are handled by ForceUpdateModal.)
export default function OtaUpdatePrompt() {
  const [phase, setPhase] = useState('idle'); // idle | available | downloading | ready | error
  const [info, setInfo] = useState(null);
  const {progress} = useHotUpdaterStore();
  const dismissed = useRef(new Set()); // updates the user said "Later" to this session
  const busy = useRef(false);

  const check = useCallback(async () => {
    if (!hotUpdater || busy.current) {
      return;
    }
    busy.current = true;
    try {
      const found = await hotUpdater.checkForUpdate({updateStrategy: 'appVersion'});
      if (!found || dismissed.current.has(found.id)) {
        return;
      }
      if (found.status !== 'UPDATE') {
        // A rollback to a known-good version: stage it quietly, it applies on the next launch.
        await found.updateBundle();
        return;
      }
      setInfo(found);
      setPhase('available');
    } catch (e) {
      // offline / server hiccup: stay quiet, try again next time
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    check();
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') {
        check();
      }
    });
    return () => sub.remove();
  }, [check]);

  const download = async () => {
    setPhase('downloading');
    busy.current = true;
    try {
      const ok = await info.updateBundle();
      setPhase(ok ? 'ready' : 'error');
    } catch (e) {
      setPhase('error');
    } finally {
      busy.current = false;
    }
  };

  const later = () => {
    if (info) {
      dismissed.current.add(info.id);
    }
    setPhase('idle');
  };

  if (phase === 'idle') {
    return null;
  }

  const forced = !!info?.shouldForceUpdate;
  const pct = Math.max(0, Math.min(100, Math.round((progress || 0) * 100)));

  return (
    <Modal transparent visible statusBarTranslucent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.badge, phase === 'error' && {backgroundColor: '#FBE4E1'}]}>
            {phase === 'downloading' ? (
              <ActivityIndicator color={Brand.primary} />
            ) : (
              <Icon
                name={phase === 'ready' ? 'check-bold' : phase === 'error' ? 'alert-circle-outline' : 'cellphone-arrow-down'}
                size={28}
                color={phase === 'error' ? '#C0392B' : Brand.primary}
              />
            )}
          </View>

          {phase === 'available' && (
            <>
              <Text style={styles.title}>Update available</Text>
              <Text style={styles.text}>
                {info?.message ? `What's new: ${info.message}` : 'A new version of PRASH is ready to download.'}
              </Text>
              <TouchableOpacity style={styles.primary} onPress={download}>
                <Text style={styles.primaryText}>Download update</Text>
              </TouchableOpacity>
              {!forced && (
                <TouchableOpacity style={styles.ghost} onPress={later}>
                  <Text style={styles.ghostText}>Later</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {phase === 'downloading' && (
            <>
              <Text style={styles.title}>Downloading update</Text>
              <Text style={styles.text}>Please keep the app open.</Text>
              <View style={styles.track}>
                <View style={[styles.fill, {width: `${pct}%`}]} />
              </View>
              <Text style={styles.pct}>{pct}%</Text>
            </>
          )}

          {phase === 'ready' && (
            <>
              <Text style={styles.title}>Update ready</Text>
              <Text style={styles.text}>Restart PRASH to apply the update.</Text>
              <TouchableOpacity style={styles.primary} onPress={() => hotUpdater.reload()}>
                <Text style={styles.primaryText}>Restart now</Text>
              </TouchableOpacity>
              {!forced && (
                <TouchableOpacity style={styles.ghost} onPress={later}>
                  <Text style={styles.ghostText}>Later (applies next launch)</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {phase === 'error' && (
            <>
              <Text style={styles.title}>Couldn't download the update</Text>
              <Text style={styles.text}>Check your connection and try again.</Text>
              <TouchableOpacity style={styles.primary} onPress={download}>
                <Text style={styles.primaryText}>Try again</Text>
              </TouchableOpacity>
              {!forced && (
                <TouchableOpacity style={styles.ghost} onPress={later}>
                  <Text style={styles.ghostText}>Not now</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(20,10,25,0.55)', alignItems: 'center', justifyContent: 'center', padding: 28},
  card: {width: '100%', backgroundColor: '#fff', borderRadius: 26, padding: 24, alignItems: 'center'},
  badge: {width: 64, height: 64, borderRadius: 32, backgroundColor: '#F6EEF2', alignItems: 'center', justifyContent: 'center'},
  title: {color: '#17171C', fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center'},
  text: {color: '#6B6B76', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center'},
  primary: {alignSelf: 'stretch', backgroundColor: Brand.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 20},
  primaryText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  ghost: {alignSelf: 'stretch', alignItems: 'center', paddingVertical: 12, marginTop: 6},
  ghostText: {color: Brand.primary, fontSize: 14, fontWeight: '600'},
  track: {alignSelf: 'stretch', height: 10, borderRadius: 5, backgroundColor: '#F0E4EA', overflow: 'hidden', marginTop: 20},
  fill: {height: '100%', borderRadius: 5, backgroundColor: Brand.primary},
  pct: {color: '#6B6B76', fontSize: 13, fontWeight: '600', marginTop: 8},
});
