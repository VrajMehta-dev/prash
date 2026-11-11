import React, {useState} from 'react';
import 'react-native-get-random-values'; // Place this first
import {ActivityIndicator} from 'react-native';
import 'react-native-gesture-handler';
import {ThemeProvider} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/es/integration/react';
import Navigator from '@navigation';
import {persistor, store} from '@redux/store/configureStore';
import ForceUpdateModal from '@components/ForceUpdateModal';
import OtaUpdatePrompt from '@components/OtaUpdatePrompt';
import OfflineScreen from '@components/OfflineScreen';
import ErrorBoundary from '@components/ErrorBoundary';
import '@utils/session'; // installs token refresh + 401 retry on fetch

// import TrackPlayer from 'react-native-track-player';

const App = () => {
  const [loading, setLoading] = useState(true);

  // this function for initialize store and handle the loader
  function onBeforeLift() {
    if (store) {
      setLoading(false);
    }
  }
  // TrackPlayer.setupPlayer().then(() => {
  // });
  return (
    <ThemeProvider>
      <Provider store={store}>
        <PersistGate
          loading={<ActivityIndicator />}
          persistor={persistor}
          onBeforeLift={onBeforeLift}>
          <ErrorBoundary>{loading ? <ActivityIndicator /> : <Navigator />}</ErrorBoundary>
          <ErrorBoundary silent>
            <ForceUpdateModal />
            <OfflineScreen />
            <OtaUpdatePrompt />
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
};

export default App;
