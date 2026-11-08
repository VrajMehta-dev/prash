import React from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Brand} from '@config/brand';
import {CANVAS, ITEMS} from './layout';
import Key from '../../assets/illustrations/key.svg';
import Calendar from '../../assets/illustrations/calendar.svg';
import PaymentReceipt from '../../assets/illustrations/payment-receipt.svg';
import ApartmentBuilding from '../../assets/illustrations/apartment-building.svg';
import LeftHome from '../../assets/illustrations/left-home.svg';
import RightHome from '../../assets/illustrations/right-home.svg';
import UtilityBill from '../../assets/illustrations/utility-bill.svg';
import ElectricalOutlet from '../../assets/illustrations/electrical-outlet.svg';
import Compliance from '../../assets/illustrations/compliance.svg';
import RentalOutlet from '../../assets/illustrations/rental-outlet.svg';
import ElectricityMeter from '../../assets/illustrations/electricity-meter.svg';
import DepositCoins from '../../assets/illustrations/deposit-coins.svg';
import ProtectiveShield from '../../assets/illustrations/protective-shield.svg';
import DepositPadlock from '../../assets/illustrations/deposit-padlock.svg';

const ART = {
  'key': Key,
  'calendar': Calendar,
  'payment-receipt': PaymentReceipt,
  'apartment-building': ApartmentBuilding,
  'left-home': LeftHome,
  'right-home': RightHome,
  'utility-bill': UtilityBill,
  'electrical-outlet': ElectricalOutlet,
  'compliance': Compliance,
  'rental-outlet': RentalOutlet,
  'electricity-meter': ElectricityMeter,
  'deposit-coins': DepositCoins,
  'protective-shield': ProtectiveShield,
  'deposit-padlock': DepositPadlock,
};

// Brand screen background from the Figma "PRASH mobile logo" frame: vertical maroon
// gradient + faint rental-themed line illustrations. The 390x844 canvas is scaled to cover.
const BrandBackdrop = ({illustrations = true, style, children}) => {
  const {width, height} = useWindowDimensions();
  const scale = Math.max(width / CANVAS.w, height / CANVAS.h);
  return (
    <LinearGradient
      colors={[Brand.gradientTop, Brand.gradientBottom]}
      style={[styles.fill, style]}>
      {illustrations && (
        <View
          pointerEvents="none"
          style={[
            styles.canvas,
            {
              left: (width - CANVAS.w) / 2,
              top: (height - CANVAS.h) / 2,
              transform: [{scale}],
            },
          ]}>
          {ITEMS.map(it => {
            const Art = ART[it.name];
            return (
              <View
                key={it.name}
                style={{
                  position: 'absolute',
                  left: it.cx - it.w / 2,
                  top: it.cy - it.h / 2,
                  width: it.w,
                  height: it.h,
                  opacity: it.opacity,
                  transform: [{rotate: `${it.rot}deg`}],
                }}>
                <Art
                  width={it.svgW}
                  height={it.svgH}
                  style={{position: 'absolute', left: -it.ml, top: -it.mt}}
                />
              </View>
            );
          })}
        </View>
      )}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fill: {flex: 1, overflow: 'hidden'},
  canvas: {position: 'absolute', width: CANVAS.w, height: CANVAS.h},
});

export default BrandBackdrop;
