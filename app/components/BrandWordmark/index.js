import React from 'react';
import {View, Text} from 'react-native';
import FestivalMark, {MOTIFS} from '@components/FestivalMark';
import {Brand} from '@config/brand';
import {useFestival} from '@utils/useFestival';

// The PRASH wordmark. While a festival is on (decided by the backend's festival calendar) its logo
// mark sits above the name and, optionally, a greeting below. Pass the screen's own Text style.
export default function BrandWordmark({textStyle, markSize = 48, greetingStyle}) {
  const festival = useFestival();
  const active = festival && MOTIFS[festival.key] ? festival : null;
  return (
    <View style={{alignItems: 'center'}}>
      {active && <FestivalMark name={active.key} size={markSize} />}
      <Text style={textStyle}>{Brand.name}</Text>
      {active && !!greetingStyle && <Text style={greetingStyle}>{active.greeting}</Text>}
    </View>
  );
}
