import _, {isEmpty, isObject, isArray} from 'lodash';
import axios from 'axios';
import BaseSetting from '@config/setting';
import {store} from '@redux/store/configureStore';
import {logout} from './commonFunction';

export const getApiData = async (
  endpoint,
  method,
  data,
  headers,
  customUrl = false,
) => {
  const authState = store?.getState() || {};
  const token = authState?.auth?.accessToken || '';

  let authHeaders = {
    'Content-Type':
      method?.toLowerCase() === 'get'
        ? 'multipart/form-data'
        : 'application/json',
    authorization: token ? `Bearer ${token}` : '',
  };

  if (headers) {
    authHeaders = headers;
  }

  try {
    const config = {
      method: method,
      timeout: BaseSetting.timeOut,
      url: customUrl ? endpoint : BaseSetting.api + endpoint,
      headers: authHeaders,
      data: data || {},
    };
    let response = await axios(config);
    console.log('🚀 ~ App ~ getApiData ->', config);

    let responseStatus = response.status;

    if (
      (response?.data?.code == 'authentication_failed' ||
        response?.code === 402 ||
        response?.status === 402) &&
      !_.isEmpty(token)
    ) {
      logout();
      return;
    }
    const res = response?.data || {
      status: responseStatus === 200 ? true : responseStatus,
      response: response.data,
    };

    return res;
  } catch (error) {
    console.log('error----', error);
    if (error.response) {
      let returnObj = error?.response?.data;
      if (error.response?.status === 402 || error.response?.code === 402) {
        logout();
        return;
      }

      if (
        error?.response?.data?.message ===
        'Your request was made with invalid credentials.'
      ) {
        logout();
        return;
      }
      return returnObj;
    } else {
      return {
        message: error?.message,
        status: false,
      };
    }
  }
};

function isValidJSON(myString) {
  try {
    JSON.parse(myString);
    return true;
  } catch (e) {
    return false;
  }
}

export function getApiDataProgress(
  endpoint,
  method,
  data,
  header,
  onProgress,
  customUrl = false,
) {
  const authState = store?.getState() || {};
  const token = authState?.auth?.accessToken || '';

  const headers = {
    'Content-Type': 'multipart/form-data',
    authorization: token ? `Bearer ${token}` : '',
  };
  return new Promise((resolve, reject) => {
    const url = customUrl ? endpoint : BaseSetting.api + endpoint;
    const oReq = new XMLHttpRequest();
    oReq.upload.addEventListener('progress', event => {
      if (event.lengthComputable) {
        const progress = (event.loaded * 100) / event.total;
        if (onProgress) {
          onProgress(progress);
        }
      } else {
        // Unable to compute progress information since the total size is unknown
      }
    });

    const query = new FormData();
    if (data && Object.keys(data).length > 0) {
      Object.keys(data).map(k => {
        if (isArray(data[k]) && !isEmpty(data[k]) && data[k].length > 0) {
          data[k].map(item => {
            query.append(k, item);
          });
        } else {
          query.append(k, data[k]);
        }
      });
    }
    const params = query;
    oReq.open(method, url, true);
    oReq.setRequestHeader('Access-Control-Allow-Origin', '*');
    oReq.setRequestHeader('Access-Control-Allow-Methods', 'POST');
    oReq.setRequestHeader('Content-Type', 'multipart/form-data');
    // oReq.setRequestHeader('X-localization', language);

    const paramHeader = header ? header : headers;
    if (isObject(paramHeader)) {
      Object.keys(paramHeader).map(hK => {
        oReq.setRequestHeader(hK, paramHeader[hK]);
      });
    }

    // if (token) {
    //   oReq.setRequestHeader('Authorization', `Bearer ${token}`);
    // }
    console.log('🚀 ~ App ~ getApiDataProgress ~>', {
      method: method,
      url: url,
      headers: paramHeader,
      data: data || {},
      params: params,
    });
    oReq.send(params);
    oReq.onreadystatechange = () => {
      if (oReq.readyState === XMLHttpRequest.DONE) {
        if (oReq.readyState == 4 && oReq.status == 200) {
          try {
            let responseJson;
            if (isValidJSON(oReq.responseText)) {
              responseJson = JSON.parse(oReq.responseText);
            } else {
              responseJson = String(oReq.responseText);
            }
            if (
              responseJson.code === 'authentication_failed' ||
              responseJson?.status === 402 ||
              responseJson?.status === 403 ||
              responseJson?.code === 402
            ) {
              logout();
            } else {
              if (oReq.responseText === 'Stream Closed') {
                resolve(responseJson);
              } else {
                resolve(responseJson);
              }
            }
          } catch (exe) {
            console.log('exe===>>>', exe);
            reject(exe);
          }
        } else {
          let errorMsg;

          if (isValidJSON(oReq.responseText)) {
            const responseJson = JSON.parse(oReq?.responseText);
            errorMsg =
              !_.isEmpty(responseJson) &&
              !_.isEmpty(responseJson?.message) &&
              _.isString(responseJson?.message)
                ? responseJson?.message
                : `status failed ${oReq.status}`;
          } else {
            errorMsg =
              !_.isEmpty(oReq?.responseText) && _.isString(oReq?.responseText)
                ? oReq.responseText
                : `status failed ${oReq.status}`;
          }

          if (oReq.status == 402) {
            logout();
            resolve({
              status: false,
              message: errorMsg,
            });
          } else {
            if (oReq.status == 0) {
              resolve({
                status: false,
                message: errorMsg,
                recallApi: true,
              });
            } else {
              resolve({
                status: false,
                message: errorMsg,
              });
            }
          }
        }
      }
    };
  });
}
