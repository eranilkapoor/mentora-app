import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockUpdateFilters = jest.fn();
const mockUpdateSettings = jest.fn();
const mockUpdateWeights = jest.fn();
const mockUpdateAboutPartner = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

let mockPreferenceData: unknown;
let mockPreferenceLoading = false;
let mockPreferenceError: unknown;
const mockT = (key: string) => key;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
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

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/hooks/useEnumOptions', () => ({
  useEnumOptions: (values: Record<string, string>) =>
    Object.values(values).map((value) => ({ label: value, value })),
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

jest.mock('./components/PreferenceSectionCard', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    PreferenceSectionCard: ({
      title,
      sectionKey,
      onSave,
      children,
    }: {
      title: string;
      sectionKey: string;
      onSave: (section: string) => void;
      children: React.ReactNode;
    }) => (
      <View>
        <Text>{title}</Text>
        {children}
        <Pressable onPress={() => onSave(sectionKey)}>
          <Text>{`save:${sectionKey}`}</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('./components/WeightSlider', () => {
  const { Text } = require('react-native');
  return {
    WeightSlider: ({ label }: { label: string }) => <Text>{label}</Text>,
  };
});

jest.mock('@/core/components/SearchMultiSelect', () => {
  const { Text } = require('react-native');
  return {
    SearchMultiSelect: ({ label }: { label: string }) => <Text>{label}</Text>,
  };
});

jest.mock('@/core/components/TagInput', () => {
  const { Text } = require('react-native');
  return { TagInput: ({ label }: { label: string }) => <Text>{label}</Text> };
});

jest.mock('@/core/components/MultiSelectPill', () => {
  const { Text } = require('react-native');
  return {
    MultiSelectPill: ({ label }: { label: string }) => <Text>{label}</Text>,
  };
});

jest.mock('@/core/components/SingleSelectPill', () => {
  const { Text } = require('react-native');
  return {
    SingleSelectPill: ({ label }: { label: string }) => <Text>{label}</Text>,
  };
});

jest.mock('@/core/components/NumberStepper', () => {
  const { Text } = require('react-native');
  return {
    NumberStepper: ({ label }: { label: string }) => <Text>{label}</Text>,
  };
});

jest.mock('@/core/components/ToggleRow', () => {
  const { Pressable, Text } = require('react-native');
  return {
    ToggleRow: ({
      label,
      value,
      onChange,
    }: {
      label: string;
      value: boolean;
      onChange: (value: boolean) => void;
    }) => (
      <Pressable onPress={() => onChange(!value)}>
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/core/utils/toast', () => ({
  showError: (params: unknown) => mockShowError(params),
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

jest.mock('@/store/services/preferenceApi.service', () => ({
  useGetMyPreferenceQuery: () => ({
    data: mockPreferenceData,
    error: mockPreferenceError,
    isLoading: mockPreferenceLoading,
  }),
  useUpdatePreferenceFiltersMutation: () => [mockUpdateFilters],
  useUpdatePreferenceSettingsMutation: () => [mockUpdateSettings],
  useUpdatePreferenceWeightsMutation: () => [mockUpdateWeights],
  useUpdateAboutPartnerMutation: () => [mockUpdateAboutPartner],
}));

import EditPreferenceScreen from './EditPreference.screen';

describe('EditPreferenceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPreferenceLoading = false;
    mockPreferenceError = undefined;
    mockPreferenceData = {
      success: true,
      data: {
        filters: {
          age: { min: 24, max: 32 },
          height: { min: 150, max: 180 },
          annualIncome: { min: 300000, max: 2000000 },
          religion: [],
        },
        settings: {
          isStrict: false,
          allowPartialMatches: true,
          horoscopeRequired: false,
          profileVerificationRequired: false,
          minimumMatchScore: 50,
        },
        weights: {
          age: 10,
          height: 10,
          religion: 15,
          caste: 10,
          location: 10,
          education: 10,
          occupation: 10,
          lifestyle: 10,
          horoscope: 15,
        },
        aboutPartner: 'Kind and family oriented',
      },
    };
    for (const fn of [
      mockUpdateFilters,
      mockUpdateSettings,
      mockUpdateWeights,
      mockUpdateAboutPartner,
    ]) {
      fn.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    }
  });

  it('loads preferences and saves about, settings, and weights sections', async () => {
    const { getByText } = await render(
      <EditPreferenceScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await waitFor(() => {
      expect(getByText('preference.title')).toBeTruthy();
    });

    await fireEvent.press(getByText('preference.title'));
    await fireEvent.press(getByText('preference.settings.strict_mode'));
    await fireEvent.press(getByText('save:about'));
    await fireEvent.press(getByText('save:settings'));
    await fireEvent.press(getByText('save:weights'));

    expect(mockGoBack).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockUpdateAboutPartner).toHaveBeenCalledWith({
        aboutPartner: 'Kind and family oriented',
      });
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ isStrict: true })
      );
      expect(mockUpdateWeights).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith({
        title: 'common.saved',
        message: 'preference.success.section_saved',
      });
    });
  });

  it('shows loader while preferences load', async () => {
    mockPreferenceLoading = true;
    mockPreferenceData = undefined;

    const { getByText } = await render(
      <EditPreferenceScreen navigation={{ goBack: mockGoBack } as never} />
    );

    expect(getByText('loader')).toBeTruthy();
  });
});
