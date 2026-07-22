import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockDispatch = jest.fn();
const mockUpdateLocalizationSettings = jest.fn();
const mockSetLanguage = jest.fn((value: string) => ({
  type: 'settings/setLanguage',
  payload: value,
}));
const mockSetLocationSharing = jest.fn((value: boolean) => ({
  type: 'settings/setLocationSharing',
  payload: value,
}));

let mockLocalizationData: unknown;
let mockLocalizationLoading = false;

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
      value,
      onChange,
    }: {
      label: string;
      value?: boolean;
      onChange: (value: boolean) => void;
    }) => (
      <Pressable onPress={() => onChange(!(value ?? false))}>
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

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ settings: { language: 'en', locationSharing: true } }),
}));

jest.mock('@/store/slices/settings.slice', () => ({
  setLanguage: (value: string) => mockSetLanguage(value),
  setLocationSharing: (value: boolean) => mockSetLocationSharing(value),
}));

jest.mock('@/store/services/localizationSettingsApi.service', () => ({
  useGetLocalizationSettingsQuery: () => ({
    data: mockLocalizationData,
    isLoading: mockLocalizationLoading,
  }),
  useUpdateLocalizationSettingsMutation: () => [mockUpdateLocalizationSettings],
}));

import LocalizationSettingsScreen from './LocalizationSettings.screen';

describe('LocalizationSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalizationLoading = false;
    mockLocalizationData = {
      localization: {
        appLanguage: 'en',
        shareLocation: true,
        region: 'IN',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR',
      },
    };
    mockUpdateLocalizationSettings.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          shareLocation: false,
        }),
    });
  });

  it('updates language, region formats, and location sharing', async () => {
    const { getByText } = await render(
      <LocalizationSettingsScreen
        navigation={{ goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.localization.title'));
    await fireEvent.press(getByText('settings.localization.app_language'));
    await fireEvent.press(
      getByText('settings.localization.app_language:language.hindi')
    );
    await fireEvent.press(getByText('settings.share_location'));
    await fireEvent.press(getByText('settings.localization.currency'));
    await fireEvent.press(getByText('settings.localization.currency:USD'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockSetLanguage).toHaveBeenCalledWith('hi');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'settings/setLanguage',
      payload: 'hi',
    });
    expect(mockUpdateLocalizationSettings).toHaveBeenCalledWith({
      appLanguage: 'hi',
    });
    expect(mockUpdateLocalizationSettings).toHaveBeenCalledWith({
      shareLocation: false,
    });
    expect(mockSetLocationSharing).toHaveBeenCalledWith(false);
    expect(mockUpdateLocalizationSettings).toHaveBeenCalledWith({
      currency: 'USD',
    });
  });
});
