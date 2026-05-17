/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './src/App';  // Corrected path to App.js
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

// Register the RNTP playback service AFTER component registration.
// Required for lock-screen / Control Center / Bluetooth remote events
// to reach the JS side. The service module lives at src/service.js
// and only attaches Remote* event listeners — never imports React.
TrackPlayer.registerPlaybackService(() => require('./src/service'));

