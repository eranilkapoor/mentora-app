module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ios.tsx',
            '.android.tsx',
            '.ts',
            '.tsx',
            '.json',
          ],
          alias: {
            // Must exactly mirror tsconfig paths
            '@': './src',
          },
        },
      ],
      // Required last if you use reanimated
      'react-native-reanimated/plugin',
    ],
  };
};