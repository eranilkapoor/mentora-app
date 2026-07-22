const { getDefaultConfig } = require('expo/metro-config');
const {
  withStorybook,
} = require('@storybook/react-native/metro/withStorybook');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve @/* to src/* in the Metro bundler
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
};

module.exports = withStorybook(config, {
  enabled: process.env.STORYBOOK_ENABLED === 'true',
});
