const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve @/* to src/* in the Metro bundler
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
};

module.exports = config;