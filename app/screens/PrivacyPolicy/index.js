/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {useTheme} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import CHeader from '@components/CHeader';
import CPageLoader from '@components/CPageLoader';
import AnimatedView from '@components/AnimatedView';
import {GetTypography} from '@config/theme';
import {formatDate} from '@utils/commonFunction';
import {translate} from '@lang/Translate';
import GetStyles from './styles';

const PrivacyPolicy = ({navigation}) => {
  const styles = GetStyles();
  const Typography = GetTypography();
  const {colors} = useTheme();
  const BaseColors = colors;

  // get data from redux
  const {commonData} = useSelector(state => state.auth);

  // State Variables
  const [termsData, setTermsData] = useState('');
  const [pageLoad, setPageLoad] = useState(true);

  const defaultStyle = `<head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Urbanist&display=swap" rel="stylesheet">
      <style>
      html, body {
        overflow-x: 'hidden';
        word-break: 'break-all';
        white-space: 'wrap';
        color: ${BaseColors.mainFontBlack} !important;
        font-family: 'Urbanist', sans-serif;
        padding-left: 6px; /* Adjust the left padding as needed */
        padding-right: 6px; /* Adjust the right padding as needed */
        line-height: 1.5; 
      }
      img {
        display: inline;
        height: auto;
        max-width: 100%;
      }
        /* Chrome, Edge and Safari */
        *::-webkit-scrollbar {
            height: 4px;
            width: 4px;
        }

        *::-webkit-scrollbar-track {
            border-radius: 20px;
            background-color: #FAFAFA;
            border: 10px solid #FFFFFF;
        }

        *::-webkit-scrollbar-track:hover {
            background-color: #FAFAFA;
        }

        *::-webkit-scrollbar-track:active {
            background-color: #FAFAFA;
        }

        *::-webkit-scrollbar-thumb {
            border-radius: 14px;
            background-color: #057FFF;
            height: 2px; /* Adjust this value to change the height of the scrollbar indicator */
        }

        *::-webkit-scrollbar-thumb:hover {
            background-color: #057FFF;
        }

        *::-webkit-scrollbar-thumb:active {
            background-color: #057FFF;
        }
      </style>
    </head>`;
  const defaultHead = `<meta name="viewport" content="width=device-width, initial-scale=1">${defaultStyle}`;

  useEffect(() => {
    getTermsData();
  }, []);

  // This function is for getting Terms and Condition Data
  async function getTermsData() {
    const findPrivacyPolicy = commonData?.cmsData?.find(
      v => v.slug === 'privacy_and_policy',
    );
    setTermsData(findPrivacyPolicy);
    setPageLoad(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <CHeader
          title={translate('privacyPolicy')}
          onBackPress={() => {
            navigation?.goBack();
          }}
        />
      </View>
      {pageLoad ? (
        <CPageLoader />
      ) : (
        <AnimatedView>
          <View style={styles.main}>
            <Text
              style={[
                Typography.lastUpdatedAt,
                {marginLeft: 20, marginBottom: 20},
              ]}>
              {translate('lastUpdated')}:{' '}
              {formatDate(termsData?.updatedAt, 'full_month_date')}
            </Text>
            <WebView
              source={{html: `${defaultHead}${termsData?.description}`}}
              showsVerticalScrollIndicator={false}
              style={styles.container3}
            />
          </View>
        </AnimatedView>
      )}
    </View>
  );
};

export default PrivacyPolicy;
