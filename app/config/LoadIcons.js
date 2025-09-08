import {PixelRatio, Platform} from 'react-native';
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import icoMoonConfig from './selection.json';

const CustomIcon = createIconSetFromIcoMoon(icoMoonConfig);

const iconSize = 22;
const navIconSize =
  __DEV__ === false && Platform.OS === 'android'
    ? PixelRatio.getPixelSizeForLayoutSize(8)
    : iconSize;
const replaceSuffixPattern = /--(active|big|small|very-big)/g;

const CustIcon = {
  'Group-10870': [navIconSize, '#7E87AE'],
  'Icons---Plane': [navIconSize, '#7E87AE'],
  7: [navIconSize, '#7E87AE'],
  'Add-and-close': [navIconSize, '#7E87AE'],
  Dropdown: [navIconSize, '#7E87AE'],
  11: [navIconSize, '#7E87AE'],
  22: [navIconSize, '#7E87AE'],
  33: [navIconSize, '#7E87AE'],
  'Group-9135': [navIconSize, '#7E87AE'],
  'Group-9454': [navIconSize, '#7E87AE'],
  'Group-10744': [navIconSize, '#7E87AE'],
  'Group-10745': [navIconSize, '#7E87AE'],
  'Group-10775': [navIconSize, '#7E87AE'],
  'Group-10776': [navIconSize, '#7E87AE'],
  'Group-10801': [navIconSize, '#7E87AE'],
  Archive: [navIconSize, '#7E87AE'],
  Graph: [navIconSize, '#7E87AE'],
  'Group-10802': [navIconSize, '#7E87AE'], // edit icon
  'Group-10803': [navIconSize, '#7E87AE'],
  'Group-10865': [navIconSize, '#7E87AE'],
  'Group-11046': [navIconSize, '#7E87AE'],
  'Group-11047': [navIconSize, '#7E87AE'],
  'Group-11048': [navIconSize, '#7E87AE'],
  'Group-11049': [navIconSize, '#7E87AE'],
  'Group-11050': [navIconSize, '#7E87AE'],
  'Group-11051': [navIconSize, '#7E87AE'],
  'Group-11052': [navIconSize, '#7E87AE'],
  'Group-11053': [navIconSize, '#7E87AE'],
  'Group-11054': [navIconSize, '#7E87AE'],
  'Group-11083': [navIconSize, '#7E87AE'],
  'Group-11078': [navIconSize, '#7E87AE'],
  'Group-11080': [navIconSize, '#7E87AE'],
  'Group-11319': [navIconSize, '#7E87AE'],
  guitarist: [navIconSize, '#7E87AE'],
  Maintenance: [navIconSize, '#7E87AE'],
  megaphone: [navIconSize, '#7E87AE'],
  'money-bag': [navIconSize, '#7E87AE'],
  Other: [navIconSize, '#7E87AE'],
  'Path-16346': [navIconSize, '#7E87AE'],
  'Path-18319': [navIconSize, '#7E87AE'],
  'Path-18382': [navIconSize, '#7E87AE'],
  'Path-18383': [navIconSize, '#7E87AE'],
  'Permanent-Resident': [navIconSize, '#7E87AE'],

  Retail: [navIconSize, '#7E87AE'],
  trophy: [navIconSize, '#7E87AE'],
};

const iconsArray = [[CustIcon, CustomIcon]];

const iconsMap = {};
const iconsLoaded = new Promise(resolve => {
  const allFonts = [iconsArray].map(iconArrayMain =>
    Promise.all(
      iconArrayMain.map(iconArray =>
        Promise.all(
          Object.keys(iconArray[0]).map(iconName =>
            // IconName--suffix--other-suffix is just the mapping name in iconsMap
            iconArray[1].getImageSource(
              iconName.replace(replaceSuffixPattern, ''),
              iconArray[0][iconName][0],
              iconArray[0][iconName][1],
            ),
          ),
        ).then(
          sources =>
            Object.keys(iconArray[0]).forEach(
              (iconName, idx) => (iconsMap[iconName] = sources[idx]),
            ),
          // resolve(true);
        ),
      ),
    ).then(() => {
      resolve(true);
    }),
  );

  return Promise.all(allFonts);
});

export {iconsMap, iconsLoaded, CustomIcon};
