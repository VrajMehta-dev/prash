import {Platform, PermissionsAndroid} from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Toast from 'react-native-toast-message';
import BaseSetting from '@config/setting';
import {store} from '@redux/store/configureStore';

// Download a PDF from the API (invoice / receipt) and open it in the viewer.
export async function downloadPdf(path, fileName) {
  try {
    const res = await fetch(BaseSetting.baseUrl + path, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
        Authorization: 'Bearer ' + store.getState().auth.accessToken,
      },
    });
    if (!res.ok) {
      let msg = 'Could not download the file.';
      try {
        msg = (await res.json())?.msg || msg;
      } catch (e) {}
      Toast.show({type: 'error', text1: 'Download', text2: msg});
      return;
    }
    const blob = await res.blob();
    let filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    if (Platform.OS === 'android' && Platform.Version < 29) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
      filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
    }
    await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await RNFS.writeFile(filePath, reader.result.split(',')[1], 'base64');
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    await FileViewer.open(filePath, {
      showOpenWithDialog: true,
      displayName: fileName,
      mimeType: 'application/pdf',
    });
  } catch (e) {
    Toast.show({type: 'error', text1: 'Download', text2: 'Could not open the file.'});
  }
}
