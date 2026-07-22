import React from 'react';
import type { Preview } from '@storybook/react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { store } from '@/store';

const preview: Preview = {
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <Story />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: '#F8F8FB' },
        { name: 'dark', value: '#111827' },
      ],
    },
  },
};

export default preview;
