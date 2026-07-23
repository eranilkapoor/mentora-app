import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockUpdateAiSettings = jest.fn();

let mockAiData: unknown;
let mockAiLoading = false;

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

jest.mock('@/store/services/aiSettingsApi.service', () => ({
  useGetAiSettingsQuery: () => ({
    data: mockAiData,
    isLoading: mockAiLoading,
  }),
  useUpdateAiSettingsMutation: () => [mockUpdateAiSettings],
}));

import AiSettingsScreen from './AiSettings.screen';

describe('AiSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAiLoading = false;
    mockAiData = {
      ai: {
        aiRecommendationsEnabled: true,
        adaptiveTutorRanking: false,
        progressScoring: true,
        studyPlanSuggestions: false,
        allowAiProfileSummary: true,
        useProfileDataForPersonalization: false,
      },
    };
  });

  it('shows loader while AI settings load', async () => {
    mockAiLoading = true;

    const { getByText } = await render(
      <AiSettingsScreen navigation={{ goBack: mockGoBack } as never} />
    );

    expect(getByText('loader')).toBeTruthy();
  });

  it('updates AI preference toggles', async () => {
    const { getByText } = await render(
      <AiSettingsScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.ai.title'));
    await fireEvent.press(getByText('settings.ai.recommendations'));
    await fireEvent.press(getByText('settings.ai.smart_ranking'));
    await fireEvent.press(getByText('settings.ai.bio_generation'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockUpdateAiSettings).toHaveBeenCalledWith({
      aiRecommendationsEnabled: false,
    });
    expect(mockUpdateAiSettings).toHaveBeenCalledWith({
      adaptiveTutorRanking: true,
    });
    expect(mockUpdateAiSettings).toHaveBeenCalledWith({
      allowAiProfileSummary: false,
    });
  });
});
