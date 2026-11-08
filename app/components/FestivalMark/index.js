import React from 'react';
import Svg, {Path, Circle, Rect, Ellipse, Line, Polygon, G} from 'react-native-svg';

// One small logo mark per festival (64x64, drawn for the maroon brand gradient). The backend's
// festival_calendar.festival_key picks which one shows; unknown keys render nothing.
const W = '#FFFFFF';
const GOLD = '#FFD27A';
const MAROON = 'rgba(114,28,63,0.55)';
const rot = (deg, cx = 32, cy = 32) => `rotate(${deg} ${cx} ${cy})`;

const diya = (
  <G>
    <Circle cx="32" cy="22" r="15" fill={GOLD} opacity="0.22" />
    <Path d="M32 6 C23 19 25 30 32 33 C39 30 41 19 32 6 Z" fill={GOLD} />
    <Path d="M32 18 C28 24 29 29 32 30 C35 29 36 24 32 18 Z" fill={W} />
    <Path d="M8 38 Q32 64 56 38 Z" fill={W} />
    <Path d="M6 38 H58" stroke={W} strokeWidth="3" strokeLinecap="round" />
  </G>
);
const splash = (
  <G opacity="0.92">
    <Circle cx="22" cy="26" r="13" fill="#FF7AA8" />
    <Circle cx="42" cy="24" r="12" fill={GOLD} />
    <Circle cx="31" cy="42" r="13" fill="#7AD7FF" />
    <Circle cx="50" cy="44" r="4" fill="#9BE37A" />
    <Circle cx="12" cy="46" r="3" fill={W} />
  </G>
);
const modak = (
  <G>
    <Path d="M32 6 C34 15 47 22 47 37 C47 49 41 57 32 57 C23 57 17 49 17 37 C17 22 30 15 32 6 Z" fill={W} />
    <Path d="M32 14 V56 M25 22 Q22 40 28 55 M39 22 Q42 40 36 55" stroke={MAROON} strokeWidth="2" fill="none" />
    <Circle cx="32" cy="6" r="3" fill={GOLD} />
  </G>
);
const dandiya = (
  <G>
    <G transform={rot(35)}>
      <Rect x="29" y="4" width="6" height="56" rx="3" fill={W} />
      <Rect x="29" y="14" width="6" height="5" fill={GOLD} />
      <Rect x="29" y="45" width="6" height="5" fill={GOLD} />
    </G>
    <G transform={rot(-35)}>
      <Rect x="29" y="4" width="6" height="56" rx="3" fill={W} />
      <Rect x="29" y="14" width="6" height="5" fill="#FF7AA8" />
      <Rect x="29" y="45" width="6" height="5" fill="#FF7AA8" />
    </G>
  </G>
);
const bow = (
  <G>
    <Path d="M22 6 Q58 32 22 58" stroke={W} strokeWidth="4" fill="none" strokeLinecap="round" />
    <Line x1="22" y1="6" x2="22" y2="58" stroke={GOLD} strokeWidth="1.5" />
    <Line x1="6" y1="32" x2="52" y2="32" stroke={W} strokeWidth="3" strokeLinecap="round" />
    <Polygon points="52,26 62,32 52,38" fill={GOLD} />
    <Polygon points="6,32 12,27 12,37" fill={GOLD} />
  </G>
);
const lotus = (
  <G>
    {[-60, -30, 0, 30, 60].map(a => (
      <Ellipse key={a} cx="32" cy="34" rx="7" ry="20" fill={W} opacity={a === 0 ? 1 : 0.85} transform={rot(a, 32, 52)} />
    ))}
    <Circle cx="32" cy="38" r="4" fill={GOLD} />
    <Path d="M6 54 Q32 62 58 54" stroke={W} strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </G>
);
const trishul = (
  <G>
    <Line x1="32" y1="8" x2="32" y2="60" stroke={W} strokeWidth="3.5" strokeLinecap="round" />
    <Path d="M16 12 V26 Q16 38 32 38 Q48 38 48 26 V12" stroke={W} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <Polygon points="32,2 27,12 37,12" fill={GOLD} />
    <Polygon points="16,5 12,14 20,14" fill={GOLD} />
    <Polygon points="48,5 44,14 52,14" fill={GOLD} />
    <Ellipse cx="32" cy="50" rx="5" ry="3" fill={GOLD} />
  </G>
);
const kite = (
  <G>
    <Polygon points="34,4 52,24 34,46 16,24" fill={W} />
    <Path d="M34 4 V46 M16 24 H52" stroke={MAROON} strokeWidth="2" />
    <Path d="M34 46 Q26 52 34 56 Q42 60 34 63" stroke={GOLD} strokeWidth="2" fill="none" />
    <Polygon points="27,53 31,50 31,56" fill={GOLD} />
    <Polygon points="41,59 37,56 37,62" fill="#FF7AA8" />
  </G>
);
const flag = (
  <G>
    <Rect x="6" y="14" width="52" height="12" fill="#FF9933" />
    <Rect x="6" y="26" width="52" height="12" fill={W} />
    <Rect x="6" y="38" width="52" height="12" fill="#138808" />
    <Circle cx="32" cy="32" r="5" fill="none" stroke="#1C2E8A" strokeWidth="1.4" />
    {Array.from({length: 12}, (_, i) => (
      <Line key={i} x1="32" y1="32" x2="32" y2="27" stroke="#1C2E8A" strokeWidth="0.8" transform={rot(i * 30)} />
    ))}
    <Line x1="6" y1="8" x2="6" y2="60" stroke={W} strokeWidth="3" strokeLinecap="round" />
  </G>
);
const rakhi = (
  <G>
    <Path d="M24 40 Q14 52 22 60 M40 40 Q50 52 42 60" stroke={GOLD} strokeWidth="3" fill="none" strokeLinecap="round" />
    {Array.from({length: 8}, (_, i) => (
      <Circle key={i} cx="32" cy="14" r="5" fill={W} transform={rot(i * 45, 32, 30)} />
    ))}
    <Circle cx="32" cy="30" r="9" fill={GOLD} />
    <Circle cx="32" cy="30" r="4" fill="#FF7AA8" />
  </G>
);
const flute = (
  <G>
    <G transform={rot(-40)}>
      <Rect x="28" y="2" width="8" height="60" rx="4" fill={GOLD} />
      {[14, 24, 34, 44].map(y => (
        <Circle key={y} cx="32" cy={y} r="1.8" fill={MAROON} />
      ))}
    </G>
    <Path d="M48 30 Q58 42 44 58" stroke={W} strokeWidth="2.5" fill="none" />
    <Ellipse cx="48" cy="22" rx="8" ry="12" fill="#2FA6A0" transform={rot(20, 48, 22)} />
    <Circle cx="48" cy="22" r="4.5" fill={GOLD} />
    <Circle cx="48" cy="22" r="2" fill="#1C2E8A" />
  </G>
);
const crescent = (
  <G>
    <Path d="M40 8 A24 24 0 1 0 40 56 A19 19 0 1 1 40 8 Z" fill={W} />
    <Polygon points="48,16 50.5,22 57,22.5 52,27 53.5,33.5 48,30 42.5,33.5 44,27 39,22.5 45.5,22" fill={GOLD} />
  </G>
);
const tree = (
  <G>
    <Polygon points="32,10 46,28 18,28" fill={W} />
    <Polygon points="32,20 50,42 14,42" fill={W} />
    <Polygon points="32,32 54,56 10,56" fill={W} />
    <Rect x="29" y="56" width="6" height="6" fill={GOLD} />
    <Polygon points="32,2 34,8 40,8.5 35.5,12.5 37,18 32,15 27,18 28.5,12.5 24,8.5 30,8" fill={GOLD} />
    <Circle cx="26" cy="40" r="2" fill="#FF7AA8" />
    <Circle cx="38" cy="48" r="2" fill="#FF7AA8" />
    <Circle cx="30" cy="24" r="1.8" fill={GOLD} />
  </G>
);
const pot = (
  <G>
    <Path d="M10 8 L16 28 M18 6 L22 26 M54 8 L48 28" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
    <Path d="M16 30 Q10 56 32 58 Q54 56 48 30 Z" fill={W} />
    <Path d="M16 30 H48" stroke={W} strokeWidth="4" strokeLinecap="round" />
    <Circle cx="24" cy="26" r="6" fill={W} />
    <Circle cx="34" cy="22" r="7" fill={W} />
    <Circle cx="43" cy="27" r="5" fill={W} />
    <Path d="M20 42 Q32 48 44 42" stroke={MAROON} strokeWidth="2" fill="none" />
  </G>
);
const pookalam = (
  <G>
    <Circle cx="32" cy="32" r="27" fill="none" stroke={W} strokeWidth="2" />
    {Array.from({length: 12}, (_, i) => (
      <Ellipse key={i} cx="32" cy="15" rx="4" ry="9" fill={i % 2 ? GOLD : W} transform={rot(i * 30)} />
    ))}
    <Circle cx="32" cy="32" r="9" fill="#FF7AA8" />
    <Circle cx="32" cy="32" r="4" fill={GOLD} />
  </G>
);
const wheat = (
  <G stroke={W} strokeWidth="2.5" strokeLinecap="round">
    {[-18, 0, 18].map(a => (
      <G key={a} transform={rot(a, 32, 60)}>
        <Line x1="32" y1="60" x2="32" y2="14" />
        {[16, 24, 32, 40].map(y => (
          <G key={y}>
            <Ellipse cx="27" cy={y} rx="3" ry="5.5" fill={a === 0 ? GOLD : W} stroke="none" transform={rot(-30, 27, y)} />
            <Ellipse cx="37" cy={y} rx="3" ry="5.5" fill={a === 0 ? GOLD : W} stroke="none" transform={rot(30, 37, y)} />
          </G>
        ))}
        <Ellipse cx="32" cy="9" rx="3" ry="6" fill={a === 0 ? GOLD : W} stroke="none" />
      </G>
    ))}
  </G>
);
const fire = (
  <G>
    <Path d="M32 4 C20 20 18 30 24 40 C26 34 30 34 32 28 C34 34 38 34 40 40 C46 30 44 20 32 4 Z" fill={GOLD} />
    <Path d="M32 22 C26 32 26 38 32 44 C38 38 38 32 32 22 Z" fill={W} />
    <Path d="M10 52 L54 60 M54 52 L10 60" stroke={W} strokeWidth="4" strokeLinecap="round" />
    <Path d="M14 40 C8 48 12 52 16 50 M50 40 C56 48 52 52 48 50" stroke="#FF9933" strokeWidth="3" fill="none" strokeLinecap="round" />
  </G>
);
const khanda = (
  <G>
    <Circle cx="32" cy="32" r="14" fill="none" stroke={W} strokeWidth="3" />
    <Path d="M32 4 L38 20 L32 34 L26 20 Z" fill={W} />
    <Path d="M32 34 V60" stroke={W} strokeWidth="3.5" strokeLinecap="round" />
    <Path d="M10 12 Q2 32 14 54" stroke={GOLD} strokeWidth="4" fill="none" strokeLinecap="round" />
    <Path d="M54 12 Q62 32 50 54" stroke={GOLD} strokeWidth="4" fill="none" strokeLinecap="round" />
  </G>
);
const moon = (
  <G>
    <Circle cx="32" cy="24" r="17" fill={W} />
    <Circle cx="32" cy="24" r="23" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.6" />
    {[-50, -25, 0, 25, 50].map(a => (
      <Ellipse key={a} cx="32" cy="50" rx="4" ry="11" fill={GOLD} transform={rot(a, 32, 62)} />
    ))}
  </G>
);
const gudi = (
  <G>
    <Line x1="22" y1="6" x2="22" y2="62" stroke={W} strokeWidth="3.5" strokeLinecap="round" />
    <Path d="M22 8 H54 L46 18 L54 28 H22 Z" fill="#FF9933" />
    <Path d="M22 28 Q34 40 22 52 M22 28 Q10 40 22 52" stroke={GOLD} strokeWidth="2.5" fill="none" />
    <Path d="M12 6 Q22 -2 32 6 Z" fill={W} />
    <Circle cx="22" cy="6" r="2.5" fill={GOLD} />
  </G>
);

export const MOTIFS = {
  diwali: diya,
  holi: splash,
  ganesh: modak,
  navratri: dandiya,
  dussehra: bow,
  ram_navami: bow,
  mahavir_jayanti: lotus,
  shivratri: trishul,
  sankranti: kite,
  republic_day: flag,
  independence_day: flag,
  rakhi: rakhi,
  janmashtami: flute,
  eid: crescent,
  christmas: tree,
  pongal: pot,
  onam: pookalam,
  baisakhi: wheat,
  lohri: fire,
  gurpurab: khanda,
  buddha_purnima: moon,
  gudi_padwa: gudi,
};

export default function FestivalMark({name, size = 48}) {
  const motif = MOTIFS[name];
  if (!motif) {
    return null;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {motif}
    </Svg>
  );
}
