import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockUpdateMediaSettings = jest.fn();
const mockShowUpgradePrompt = jest.fn();

let mockMediaData: unknown;
let mockMediaLoading = false;
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
      value,
      disabled,
      onChange,
      onDisabledPress,
    }: {
      label: string;
      value?: boolean;
      disabled?: boolean;
      onChange: (value: boolean) => void;
      onDisabledPress?: () => void;
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

jest.mock('@/store/services/mediaSettingsApi.service', () => ({
  useGetMediaSettingsQuery: () => ({
    data: mockMediaData,
    isLoading: mockMediaLoading,
  }),
  useUpdateMediaSettingsMutation: () => [mockUpdateMediaSettings],
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

import MediaSettingsScreen from './MediaSettings.screen';

describe('MediaSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaLoading = false;
    mockFeatureLoading = false;
    mockFeatureAccess = true;
    mockMediaData = {
      media: {
        autoDownloadPhotos: true,
        videoAutoplay: false,
        mediaQuality: 'medium',
        blurPrivatePhotos: false,
        showMediaInGallery: true,
      },
    };
  });

  it('updates playback, quality, and gallery media settings', async () => {
    const { getByText } = await render(
      <MediaSettingsScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.media.title'));
    await fireEvent.press(getByText('settings.media.video_autoplay'));
    await fireEvent.press(getByText('settings.media.media_quality'));
    await fireEvent.press(
      getByText('settings.media.media_quality:settings.options.high')
    );
    await fireEvent.press(getByText('settings.media.show_in_gallery'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockUpdateMediaSettings).toHaveBeenCalledWith({
      videoAutoplay: true,
    });
    expect(mockUpdateMediaSettings).toHaveBeenCalledWith({
      mediaQuality: 'high',
    });
    expect(mockUpdateMediaSettings).toHaveBeenCalledWith({
      showMediaInGallery: false,
    });
  });

  it('uses upgrade prompts for restricted photo controls', async () => {
    mockFeatureAccess = false;

    const { getByText } = await render(
      <MediaSettingsScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.media.auto_download'));
    await fireEvent.press(getByText('settings.media.blur_private'));

    expect(mockShowUpgradePrompt).toHaveBeenCalledWith(
      'settings.media.auto_download'
    );
    expect(mockShowUpgradePrompt).toHaveBeenCalledWith(
      'settings.media.blur_private'
    );
    expect(mockUpdateMediaSettings).not.toHaveBeenCalled();
  });
});
