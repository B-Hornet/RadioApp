const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure mp4 video files are bundled as assets
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'mp4'];

module.exports = config;
