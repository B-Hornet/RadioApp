/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';  // Corrected path to App.js
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

