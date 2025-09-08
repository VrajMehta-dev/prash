import React from 'react';
import {useTheme} from '@react-navigation/native';
import Popover from 'react-native-popover-view/dist/Popover';
import {Placement} from 'react-native-popover-view/dist/Types';
import {Easing} from 'react-native-reanimated';
import GetStyles from './styles';

const CPopOver = props => {
  const styles = GetStyles();
  const {colors} = useTheme();
  const BaseColors = colors;
  const {
    from,
    visible = false,
    onRequestClose = () => {},
    children,
    placement = Placement.AUTO,
  } = props;

  return (
    <Popover
      statusBarTranslucent
      popoverStyle={styles.popOver}
      arrowSize={styles.arrow}
      backgroundStyle={styles.popOverBackground}
      animationConfig={{
        duration: 175,
        easing: Easing.inOut(Easing.ease),
      }}
      from={from}
      placement={placement}
      isVisible={visible}
      onCloseComplete={() => {
        console.log(`💥️ ~ onCloseComplete ~ onCloseComplete ->`);
      }}
      onRequestClose={onRequestClose}>
      {children}
    </Popover>
  );
};

export default CPopOver;
