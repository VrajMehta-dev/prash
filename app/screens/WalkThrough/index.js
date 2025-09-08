/* eslint-disable react-hooks/exhaustive-deps */
import React, {useRef, useState} from 'react';
import {Image, Text, View, useWindowDimensions} from 'react-native';
import {useDispatch} from 'react-redux';
import {useTheme} from '@react-navigation/native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import CPageLoader from '@components/CPageLoader';
import CStatusBar from '@components/CStatusBar';
import Pagination from '@components/Pagination';
import authActions from '@redux/reducers/auth/actions';
import GetStyles from './styles';
import {walkThroughData} from '@config/staticData';
import {Images} from '@config/images';
import Icon, {Icons} from '@config/Icons';
import {SplitButton} from './button';

const WalkThrough = ({navigation, route}) => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;

  const dispatch = useDispatch();
  const {setWalkThrough} = authActions;

  const {width: screenWidth} = useWindowDimensions();
  const x = useSharedValue(0);

  // References
  const flatListRef = useRef();

  // State Variables
  const [currentIndex, setCurrentIndex] = useState(0);
  const [InfoData, setInfoData] = useState(walkThroughData);
  const [loader, setLoader] = useState(false);

  const onScrollEnd = e => {
    const index = Math.min(
      Math.max(
        Math.floor(e.nativeEvent.contentOffset.x / screenWidth + 0.5),
        0,
      ),
    );
    setCurrentIndex(index);
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      x.value = event.contentOffset.x;
    },
  });

  const sliderRenderItem = ({item, index}) => {
    return (
      <View style={{backgroundColor: item.color}}>
        <View
          style={[styles.renderItemContainer, {width: screenWidth, zIndex: 10}]}
          key={item.id}>
          <Icon type={Icons.AntDesign} name="add" size={20} color={'#000'} />
          <View style={styles.textContainer}>
            <Text style={[styles.titleText]}>{item?.title}</Text>
          </View>
        </View>
        <Image
          source={Images.walkthrough}
          style={{
            position: 'absolute',
            bottom: -150,
          }}
        />
      </View>
    );
  };

  const onSubmit = (type = '') => {
    if (type !== 'skip') {
      dispatch(setWalkThrough(false));
    }
    navigation.reset({
      routes: [{name: 'Intro'}],
    });
  };

  return (
    <View style={styles.root}>
      <CStatusBar />

      {loader ? (
        <CPageLoader />
      ) : (
        <>
          <Animated.FlatList
            ref={flatListRef}
            data={InfoData}
            style={{width: screenWidth}}
            renderItem={sliderRenderItem}
            onScroll={onScroll}
            keyExtractor={item => item?.id}
            scrollsToTop={false}
            horizontal
            scrollEnabled
            pagingEnabled
            initialScrollIndex={currentIndex}
            onEndReachedThreshold={0.5}
            onMomentumScrollEnd={onScrollEnd}
            showsHorizontalScrollIndicator={false}
          />
          <Pagination data={InfoData} x={x} screenWidth={screenWidth} />
          <View style={{marginBottom: 20, marginTop: 10}}>
            <SplitButton
              splitted={currentIndex != InfoData?.length - 1}
              mainAction={{
                label: 'Continue',
                onPress: () => {
                  onSubmit();
                },
                backgroundColor: BaseColors.primary,
              }}
              leftAction={{
                label: 'Skip',
                onPress: () => {
                  onSubmit('skip');
                },
                backgroundColor: BaseColors.primaryLight,
              }}
              rightAction={{
                label: 'Continue',
                onPress: () => {
                  const temp = currentIndex + 1;
                  flatListRef?.current?.scrollToIndex({
                    animated: true,
                    index: temp,
                  });
                  setCurrentIndex(Number(temp));
                },
                backgroundColor: BaseColors.primary,
              }}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default WalkThrough;
