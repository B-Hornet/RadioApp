module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',   // Recommended ESLint rules
    'plugin:react/recommended',  // Recommended React rules
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,  // Enable linting for JSX
    },
    ecmaVersion: 2021,  // Enable ECMAScript 2021 features
    sourceType: 'module',  // Allows for the use of imports
  },
  settings: {
    react: {
      version: '18.2.0',  // Update to the React version you are using
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',  // Disable if using the new JSX transform
    'no-undef': 'error',                // Flag undefined variables
    'no-unused-vars': 'warn',           // Warn for unused variables
  },
};

