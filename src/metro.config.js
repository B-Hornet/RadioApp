// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      // This setting ensures the correct handling of image files and other assets
      assetPlugins: ['metro-react-native-babel-preset'],
    },
    resolver: {
      // Ensure PNG files are correctly identified as assets
      assetExts: [...assetExts, 'png', 'jpg', 'jpeg', 'svg'],
      sourceExts: [...sourceExts, 'svg'],
    },
  };
})();

