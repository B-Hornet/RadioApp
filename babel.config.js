module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-private-methods',
    '@babel/plugin-transform-private-property-in-object',
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: true,  // Reuse helper functions across modules
        regenerator: true,  // Enables async/await support
        corejs: false  // Avoids unwanted polyfills
      },
    ],
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};

