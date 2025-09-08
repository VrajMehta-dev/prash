/* eslint-disable react/no-unstable-nested-components */
import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  Text,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import _ from 'lodash';
import {FontFamily, GetTypography} from '@config/theme';
import Icon, {Icons} from '@config/Icons';
import {CustomIcon} from '@config/LoadIcons';
import {translate} from '@lang/Translate';
import GetStyles from './styles';

const IOS = Platform.OS === 'ios';

const CSearchInput = forwardRef((props, ref) => {
  const styles = GetStyles();
  const Typography = GetTypography();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {
    data = [],
    placeholder = translate('Search'),
    searchKey = 'title',
    onSet = () => {},
    onSearch = () => {},
    mainContainerStyle = {},
    loaderDisabled = false,
    textInputStyle = {},
    localSearch = false,
  } = props;

  useImperativeHandle(ref, () => ({
    value() {
      return search;
    },
    clear() {
      setSearch('');
    },
    loading() {
      return loader;
    },
    stopLoader() {
      setLoader(false);
    },
  }));

  const timeoutRef = useRef();
  const [search, setSearch] = useState('');
  const [loader, setLoader] = useState(false);

  const onSearchFun = val => {
    const value = val.toLowerCase();
    const optionList = val
      ? data.filter(item => item[searchKey].toLowerCase().includes(value))
      : data;
    onSet(optionList);
    return optionList;
  };

  return (
    <>
      <View style={[styles.mainFilterInputContainer, mainContainerStyle]}>
        <View style={[styles.inputContainer]}>
          <Icon
            type={Icons.AntDesign}
            name="search1"
            style={styles.searchIcon}
          />
          <TextInput
            value={search}
            onChangeText={val => {
              setSearch(val);
              if (localSearch) {
                onSearchFun(val);
              } else {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                  setLoader(true);
                  onSearch(val);
                }, 250);
              }
            }}
            style={[
              Typography.formLabel,
              {fontFamily: search ? FontFamily.semiBold : FontFamily.regular},
              styles.searchInput,
              textInputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={BaseColors.thirdFontBlack}
            returnKeyType={'done'}
            onSubmitEditing={() => {
              Keyboard.dismiss();
              if (localSearch) {
                onSearchFun(search);
              } else {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                onSearch(search);
                setLoader(true);
              }
            }}
          />

          {loader && !loaderDisabled ? (
            <View style={[styles.clearSearchContainer]}>
              <ActivityIndicator size="small" color={BaseColors.primary} />
            </View>
          ) : !_.isEmpty(search) && !loaderDisabled ? (
            <TouchableOpacity
              style={[styles.clearSearchContainer]}
              activeOpacity={0.7}
              onPress={() => {
                setSearch('');
                if (localSearch) {
                  onSet(data);
                } else {
                  onSearch('');
                }
              }}>
              <Icon
                type={Icons.Ionicons}
                name="close"
                style={[styles.closeIcon]}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </>
  );
});

export default CSearchInput;
