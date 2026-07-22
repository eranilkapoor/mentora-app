import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

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
  }),
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

jest.mock('@/core/components/settings/SettingsCard', () => {
  const { Text, View } = require('react-native');
  return {
    SettingsCard: ({
      title,
      subtitle,
      children,
    }: {
      title: string;
      subtitle?: string;
      children: React.ReactNode;
    }) => (
      <View>
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
        {children}
      </View>
    ),
  };
});

jest.mock('@/core/components/settings/SettingsSelectItem', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SettingsSelectItem: ({
      label,
      sublabel,
      onPress,
    }: {
      label: string;
      sublabel?: string;
      onPress: () => void;
    }) => (
      <Pressable onPress={onPress}>
        <Text>{label}</Text>
        {sublabel ? <Text>{sublabel}</Text> : null}
      </Pressable>
    ),
  };
});

jest.mock('./components/ContactRow', () => {
  const { Pressable, Text } = require('react-native');
  return {
    ContactRow: ({
      label,
      value,
      action,
    }: {
      label: string;
      value: string;
      action: () => void;
    }) => (
      <Pressable onPress={action}>
        <Text>{label}</Text>
        <Text>{value}</Text>
      </Pressable>
    ),
  };
});

import HelpSupportScreen from './HelpSupport.screen';

describe('HelpSupportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('navigates to support resources', async () => {
    const { getByText } = await render(
      <HelpSupportScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.support_tickets.title'));
    await fireEvent.press(getByText('settings.success_stories.title'));
    await fireEvent.press(getByText('settings.support_center.faqs'));
    await fireEvent.press(getByText('settings.support_center.privacy'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, 'SupportTickets');
    expect(mockNavigate).toHaveBeenNthCalledWith(2, 'SuccessStories');
    expect(mockNavigate).toHaveBeenNthCalledWith(3, 'Faqs');
    expect(mockNavigate).toHaveBeenNthCalledWith(4, 'PrivacyPolicy');
  });
});
