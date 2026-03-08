const path = require('path');

module.exports = {
  dependencies: {
    'react-native-gesture-handler': {
      root: path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
      platforms: {
        ios: {
          podspecPath: path.resolve(
            __dirname,
            'node_modules/react-native-gesture-handler/RNGestureHandler.podspec'
          ),
        },
      },
    },
    'react-native-video': {
      root: path.resolve(__dirname, 'node_modules/react-native-video'),
      platforms: {
        ios: {
          podspecPath: path.resolve(
            __dirname,
            'node_modules/react-native-video/react-native-video.podspec'
          ),
        },
      },
    },
  },
};
