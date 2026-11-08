import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TextInput
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import {Dropdown, MultiSelect} from 'react-native-element-dropdown';
import {useTheme} from '@react-navigation/native';
import {FontFamily, GetTypography} from '@config/theme';
import {CustomIcon} from '@config/LoadIcons';
import Icon, {Icons} from '@config/Icons';
import GetStyles from './styles';
import Arrow from './arrow';
import CErrorLog from '@components/CErrorLog';

const DropDownList = forwardRef((props, ref) => {
  const styles = GetStyles();
  const Typography = GetTypography();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {
    data = [],
    onChange = () => null,
    labelProp = 'name',
    value = '',
    placeholder = '',
    isSearch = false,
    showError = false,
    multiSelection = false,
    errorMsg = '',
    valueProp = 'id',
    label = '',
    required = false,
    disabled = false,
    dropdownPosition = '',
    placeholderStyle = {},
    loading = false,
    maxHeight = 300,
  } = props;
  const dropdownRef = useRef();
  const [filterData, setFilterData] = useState(data);
  useEffect(() => {
    setFilterData(data);
  }, [data]);
  // Custom hook for handling imperative logic with refs
  useImperativeHandle(ref, () => ({
    close() {
      dropdownRef?.current?.close();
    },
    open() {
      dropdownRef?.current?.open();
    },
  }));

  return (
    <View style={styles.container}>
      <Dropdown
        ref={dropdownRef}
        style={[
          styles.dropdown(showError),
          disabled && {
            backgroundColor: BaseColors.inputBackGround,
            opacity: 0.7,
          },
        ]}
        disable={disabled}
        placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
        renderItem={(item, selected) => {
          return (
            <TouchableOpacity
              style={styles.dropdownItem}
              activeOpacity={0.7}
              onPress={() => {
                dropdownRef?.current?.close();
                onChange(item[valueProp]);
              }}>
              <Text
                style={[
                  Typography.CInputText,
                  styles.dropdownItemText(selected),
                ]}>
                {item[labelProp]}
              </Text>
            </TouchableOpacity>
          );
        }}
        autoScroll={false}
        selectedTextStyle={[styles.selectedTextStyle]}
        inputSearchStyle={[Typography.CInputText, styles.inputSearchStyle]}
        iconStyle={styles.iconStyle}
        iconColor={BaseColors.black}
        // activeColor={BaseColors.borderColor}
        itemTextStyle={[Typography.CInputText, styles.listText]}
        containerStyle={styles.listContainer}
        data={filterData}
        search={isSearch ? true : false}
        maxHeight={maxHeight}
        dropdownPosition={dropdownPosition || 'bottom'}
        labelField={labelProp || 'name'}
        valueField={valueProp || 'id'}
        placeholder={placeholder || ''}
        searchPlaceholder="Search..."
        // renderInputSearch={renderInputSearch}
        searchQuery={(val, item) =>
          item?.toLowerCase().startsWith(val?.toLowerCase())
        }
        value={value}
        renderRightIcon={isOpen => {
          return (
            <View style={{marginRight: 15}}>
              {loading ? (
                <ActivityIndicator size={20} color={BaseColors.primary} />
              ) : (
                <Arrow isOpen={isOpen} />
              )}
            </View>
          );
        }}
        onChange={item => {
          onChange(item[valueProp]);
        }}
      />
      {showError ? <CErrorLog style={{marginTop: 5}} msg={errorMsg} /> : null}
    </View>
  );
});

export default DropDownList;
