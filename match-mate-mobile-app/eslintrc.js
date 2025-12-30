export const root = true;
export const extendsConfig = [
    '@react-native-community',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
];
export const parser = '@babel/eslint-parser';
export const parserOptions = {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
        jsx: true,
    },
    requireConfigFile: false,
};
export const plugins = [
    'react',
    'react-native',
    'react-hooks',
];
export const env = {
    'react-native/react-native': true,
    es2021: true,
    node: true,
};
export const settings = {
    react: {
        version: 'detect',
    },
};
export const rules = {
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-unused-styles': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
};