import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockUpdatePrivacySettings = jest.fn();
const mockShowUpgradePrompt = jest.fn();

let mockPrivacyData: unknown;
let mockPrivacyLoading = false;
let mockFeatureAccess = true;
let mockFeatureLoading = false;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

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

jest.mock('@/core/components/Loader', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>loader</Text> };
});

jest.mock('@/core/components/settings/SettingsCard', () => {
  const { Text, View } = require('react-native');
  return {
    SettingsCard: ({
      title,
      children,
    }: {
      title: string;
      children: React.ReactNode;
    }) => (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock('@/core/components/settings/SettingsToggleItem', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SettingsToggleItem: ({
      label,
      disabled,
      onChange,
      onDisabledPress,
      value,
    }: {
      label: string;
      disabled?: boolean;
      onChange: (value: boolean) => void;
      onDisabledPress?: () => void;
      value?: boolean;
    }) => (
      <Pressable
        onPress={() =>
          disabled ? onDisabledPress?.() : onChange(!(value ?? false))
        }
      >
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/core/components/settings/SettingsSelectItem', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SettingsSelectItem: ({
      label,
      value,
      onPress,
    }: {
      label: string;
      value?: string;
      onPress: () => void;
    }) => (
      <Pressable onPress={onPress}>
        <Text>{label}</Text>
        {value ? <Text>{value}</Text> : null}
      </Pressable>
    ),
  };
});

jest.mock('@/core/components/settings/SettingsOptionSheet', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    SettingsOptionSheet: ({
      visible,
      title,
      options,
      onSelect,
    }: {
      visible: boolean;
      title: string;
      options: { label: string; value: string }[];
      onSelect: (value: string) => void;
    }) => {
      return visible ? (
        <View>
          <Text>{`${title}-sheet`}</Text>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
            >
              <Text>{`${title}:${option.label}`}</Text>
            </Pressable>
          ))}
        </View>
      ) : null;
    },
  };
});

jest.mock('@/store/services/privacySettingsApi.service', () => ({
  useGetPrivacySettingsQuery: () => ({
    data: mockPrivacyData,
    isLoading: mockPrivacyLoading,
  }),
  useUpdatePrivacySettingsMutation: () => [mockUpdatePrivacySettings],
}));

jest.mock('../Membership/hooks/usePlanFeatureAccess', () => ({
  usePlanFeatureAccess: () => ({
    hasFeature: mockFeatureAccess,
    isLoading: mockFeatureLoading,
  }),
}));

jest.mock('../Membership/hooks/useUpgradePrompt', () => ({
  useUpgradePrompt: () => mockShowUpgradePrompt,
}));

import PrivacySettingsScreen from './PrivacySettings.screen';

describe('PrivacySettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrivacyLoading = false;
    mockFeatureLoading = false;
    mockFeatureAccess = true;
    mockPrivacyData = {
      privacy: {
        profileVisibility: 'public',
        incognitoMode: false,
        showOnlyToPremium: false,
        showPhone: false,
        showEmail: true,
        showIncome: false,
        showExactAge: true,
        showPhotosTo: 'accepted_matches',
        blurPhotosForUnmatched: false,
        allowScreenshots: true,
        showOnlineStatus: true,
        showLastSeen: 'everyone',
        allowMessagesFrom: 'all',
      },
    };
    mockUpdatePrivacySettings.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
  });

  it('updates privacy toggles and select fields', async () => {
    const { getByText } = await render(
      <PrivacySettingsScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.privacy.title'));
    await fireEvent.press(getByText('settings.privacy.show_phone'));
    await fireEvent.press(getByText('settings.privacy.who_can_see'));
    await fireEvent.press(
      getByText('settings.privacy.who_can_see:settings.options.private')
    );

    expect(mockGoBack).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockUpdatePrivacySettings).toHaveBeenCalledWith({
        showPhone: true,
      });
      expect(mockUpdatePrivacySettings).toHaveBeenCalledWith({
        profileVisibility: 'private',
      });
    });
  });

  it('routes restricted premium-only controls through the upgrade prompt', async () => {
    mockFeatureAccess = false;

    const { getByText } = await render(
      <PrivacySettingsScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.privacy.incognito'));

    expect(mockShowUpgradePrompt).toHaveBeenCalledWith(
      'settings.privacy.incognito'
    );
    expect(mockUpdatePrivacySettings).not.toHaveBeenCalled();
  });
});
