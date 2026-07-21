import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockDispatch = jest.fn();
const mockUpdateAccessibilitySettings = jest.fn();
const mockSetTheme = jest.fn((value: string) => ({
  type: 'settings/setTheme',
  payload: value,
}));

let mockAccessibilityData: unknown;
let mockAccessibilityLoading = false;

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
    selector({ settings: { theme: 'system' } }),
}));

jest.mock('@/store/slices/settings.slice', () => ({
  setTheme: (value: string) => mockSetTheme(value),
}));

jest.mock('@/store/services/accessibilitySettingsApi.service', () => ({
  useGetAccessibilitySettingsQuery: () => ({
    data: mockAccessibilityData,
    isLoading: mockAccessibilityLoading,
  }),
  useUpdateAccessibilitySettingsMutation: () => [
    mockUpdateAccessibilitySettings,
  ],
}));

import AccessibilitySettingsScreen from './AccessibilitySettings.screen';

describe('AccessibilitySettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessibilityLoading = false;
    mockAccessibilityData = {
      accessibility: {
        fontSize: 'medium',
        boldText: false,
        highContrastMode: false,
        reduceAnimations: true,
        screenReaderOptimized: false,
      },
    };
  });

  it('updates text, display, and theme accessibility settings', async () => {
    const { getByText } = await render(
      <AccessibilitySettingsScreen
        navigation={{ goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.accessibility.title'));
    await fireEvent.press(getByText('settings.accessibility.bold_text'));
    await fireEvent.press(getByText('settings.accessibility.font_size'));
    await fireEvent.press(
      getByText('settings.accessibility.font_size:settings.options.large')
    );
    await fireEvent.press(getByText('settings.theme'));
    await fireEvent.press(getByText('settings.theme:theme.dark'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockUpdateAccessibilitySettings).toHaveBeenCalledWith({
      boldText: true,
    });
    expect(mockUpdateAccessibilitySettings).toHaveBeenCalledWith({
      fontSize: 'large',
    });
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'settings/setTheme',
      payload: 'dark',
    });
  });
});
