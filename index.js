/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
const App = require('./app/index').default;

AppRegistry.registerComponent(appName, () => App);
