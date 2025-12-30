export const presets = ['module:metro-react-native-babel-preset'];
export const plugins = [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    'react-native-reanimated/plugin',
];
export const env = {
    production: {
        plugins: ['react-native-paper/babel'],
    },
};