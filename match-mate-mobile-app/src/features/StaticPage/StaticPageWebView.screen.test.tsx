import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
let mockAuthenticated = false;
const mockReload = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('react-native-vector-icons/Feather', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('react-native-webview', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(
      (
        { source }: { source: { uri: string } },
        ref: React.ForwardedRef<{ reload: () => void }>
      ) => {
        React.useImperativeHandle(ref, () => ({ reload: mockReload }));
        return <Text>{`webview:${source.uri}`}</Text>;
      }
    ),
  };
});

jest.mock('@/core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: new Proxy(
        {},
        {
          get: () => '#111827',
        }
      ),
    },
    isDark: false,
    accessibility: {},
  }),
}));

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/components/Header', () => {
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({
      title,
      onBackPress,
    }: {
      title: string;
      onBackPress: () => void;
    }) => (
      <Pressable onPress={onBackPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/core/utils/config', () => ({
  getApiOrigin: () => 'https://api.example.com',
}));

jest.mock('@/store/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: { accessToken: mockAuthenticated ? 'token' : undefined },
    }),
}));

import StaticPageWebViewScreen from './StaticPageWebView.screen';

describe('StaticPageWebViewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthenticated = false;
  });

  it('renders the static page URL and navigates back', async () => {
    const { getByText } = await render(
      <StaticPageWebViewScreen
        navigation={{
          goBack: mockGoBack,
          canGoBack: () => true,
          navigate: mockNavigate,
        }}
        titleKey="legal.privacy"
        slug="privacy-policy"
      />
    );

    expect(
      getByText(/webview:https:\/\/api\.example\.com\/privacy-policy/)
    ).toBeTruthy();

    await fireEvent.press(getByText('legal.privacy'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('falls back to authenticated or guest destinations', async () => {
    const { getByText, unmount } = await render(
      <StaticPageWebViewScreen
        navigation={{
          goBack: mockGoBack,
          canGoBack: () => false,
          navigate: mockNavigate,
        }}
        titleKey="legal.terms"
        slug="terms-conditions"
      />
    );

    await fireEvent.press(getByText('legal.terms'));
    expect(mockNavigate).toHaveBeenCalledWith('Welcome');

    await unmount();
    mockAuthenticated = true;
    const next = await render(
      <StaticPageWebViewScreen
        navigation={{
          goBack: mockGoBack,
          canGoBack: () => false,
          navigate: mockNavigate,
        }}
        titleKey="legal.terms"
        slug="terms-conditions"
      />
    );

    await fireEvent.press(next.getByText('legal.terms'));
    expect(mockNavigate).toHaveBeenCalledWith('SettingsScreen');
  });
});
