// File: index.js
import { AppRegistry } from 'react-native';
import App from './src/App'; // Ensure this path is correct
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

