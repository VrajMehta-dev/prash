/* eslint-disable react/react-in-jsx-scope */
import {TouchableOpacity} from 'react-native';
import {FlatList, Text, View} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import CHeader from '@components/CHeader';
import AnimatedView from '@components/AnimatedView';
import {CustomIcon} from '@config/LoadIcons';
import {HelpAndSupportArray} from '@config/staticData';
import {translate} from '@lang/Translate';
import GetStyles from './styles';

const HelpAndSupport = ({navigation}) => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {userData} = useSelector(state => state.auth);

  return (
    <View style={styles.root}>
      <CHeader
        title={translate('HelpSupport')}
        titleStyle={{width: '80%'}}
        leftStyle={{width: '10%'}}
        onBackPress={() => {
          navigation?.goBack();
        }}
      />
      <AnimatedView>
        <FlatList
          data={HelpAndSupportArray}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.container}
              onPress={() => {
                if (item.id === 1) {
                  navigation?.navigate('FAQs');
                } else if (item.id === 2) {
                  navigation.navigate('ContactUs', {data: userData});
                } else if (item.id === 3) {
                  navigation?.navigate('PrivacyPolicy');
                } else if (item.id === 4) {
                  navigation?.navigate('TermsAndConditions');
                } else if (item.id === 5) {
                  navigation?.navigate('About');
                }
              }}>
              <Text style={styles.title}>{translate(item.title)}</Text>
              <CustomIcon
                name="Arrow---Right-2"
                color={BaseColors.mainFontBlack}
                size={24}
              />
            </TouchableOpacity>
          )}
        />
      </AnimatedView>
    </View>
  );
};

export default HelpAndSupport;
