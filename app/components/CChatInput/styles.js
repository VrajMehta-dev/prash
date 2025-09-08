import {BaseColors, FontFamily} from '@config/theme';
import {StyleSheet} from 'react-native';

// Define your styles within a functional component
const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    // borderTopWidth: 1,
    marginBottom: 20,
  },
  textInputOfChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10, // Adjust the value to match the desired roundness
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F5', // Update the background color
    height: 50,
    width: '80%',
  },
  sendButton: {
    width: 50,
    height: 50,
    backgroundColor: BaseColors.primaryLight, // Update the background color to match the yellow button
    alignItems: 'center',
    left: 5,
    justifyContent: 'center',
    borderRadius: 28, // Adjust the value to match the desired roundness
  },
  txtSty: {
    flex: 1,
    color: BaseColors.black,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    fontSize: 15,
    marginRight: 10, // Adjust margin to create space between text input and smile icon
  },
  smileIcon: {
    paddingRight: 5,
  },
});

export default styles;
