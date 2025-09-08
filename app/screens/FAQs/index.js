/* eslint-disable react/react-in-jsx-scope */
import React, {useRef, useState} from 'react';
import {FlatList, View, ScrollView} from 'react-native';
import CHeader from '@components/CHeader';
import Accordion from '@components/Accordion';
import CPageLoader from '@components/CPageLoader';
import AnimatedView from '@components/AnimatedView';
import {translate} from '@lang/Translate';
import GetStyles from './styles';

const FAQs = ({navigation}) => {
  const styles = GetStyles();

  const accordionRef = useRef([]);

  const [pageLoader, setPageLoader] = useState(true);
  const [faqLoader, setFaqLoader] = useState(false);
  const [faqList, setFaqList] = useState([]);

  return (
    <View style={styles.root}>
      <CHeader
        title={translate('FAQs')}
        onBackPress={() => {
          navigation?.goBack();
        }}
        mainContainerStyle={{paddingHorizontal: 20}}
      />
      {pageLoader ? (
        <CPageLoader />
      ) : (
        <AnimatedView>
          <View style={[styles.mainContainer]}>
            {faqLoader ? (
              <CPageLoader />
            ) : (
              <ScrollView
                contentContainerStyle={{flexGrow: 1}}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <FlatList
                  data={faqList}
                  scrollEnabled={false}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingHorizontal: 20}}
                  renderItem={({item, index}) => {
                    return (
                      <Accordion
                        ref={element => {
                          accordionRef.current[index] = element;
                        }}
                        title={item?.title}
                        description={item?.description}
                        onPress={() => {
                          for (let i = 0; i < faqList.length; i++) {
                            accordionRef?.current[i]?.close();
                          }
                        }}
                      />
                    );
                  }}
                  ListEmptyComponent={
                    <CPageLoader lisEmptyComponent showTitle />
                  }
                />
              </ScrollView>
            )}
          </View>
        </AnimatedView>
      )}
    </View>
  );
};

export default FAQs;
