import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockUpdateCommunicationSettings = jest.fn();
const mockShowUpgradePrompt = jest.fn();

let mockCommunicationData: unknown;
let mockCommunicationLoading = false;
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
      disabled,
      onPress,
      onDisabledPress,
    }: {
      label: string;
      value?: string;
      disabled?: boolean;
      onPress: () => void;
      onDisabledPress?: () => void;
    }) => (
      <Pressable onPress={() => (disabled ? onDisabledPress?.() : onPress())}>
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
    }) =>
      visible ? (
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
      ) : null,
  };
});

jest.mock('./components/AutoReplyInput', () => {
  const { TextInput } = require('react-native');
  return {
    AutoReplyInput: ({
      value,
      onChangeText,
      onSubmitEditing,
    }: {
      value: string;
      onChangeText: (value: string) => void;
      onSubmitEditing: () => void;
    }) => (
      <TextInput
        accessibilityLabel="auto-reply-input"
        value={value}
        onSubmitEditing={onSubmitEditing}
        onChangeText={onChangeText}
      />
    ),
  };
});

jest.mock('@/store/services/communicationSettingsApi.service', () => ({
  useGetCommunicationSettingsQuery: () => ({
    data: mockCommunicationData,
    isLoading: mockCommunicationLoading,
  }),
  useUpdateCommunicationSettingsMutation: () => [
    mockUpdateCommunicationSettings,
  ],
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

import CommunicationSettingsScreen from './CommunicationSettings.screen';

describe('CommunicationSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCommunicationLoading = false;
    mockFeatureLoading = false;
    mockFeatureAccess = true;
    mockCommunicationData = {
      communication: {
        whoCanMessage: 'all',
        whoCanCall: 'matches_only',
        showReadReceipts: true,
        showTypingIndicator: true,
        autoReplyEnabled: true,
        autoReplyMessage: 'Away for now',
        allowVoiceCalls: true,
        allowVideoCalls: false,
      },
    };
    mockUpdateCommunicationSettings.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
  });

  it('updates message permissions, toggles, and auto reply text', async () => {
    const { getByLabelText, getByText } = await render(
      <CommunicationSettingsScreen
        navigation={{ goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.communication.title'));
    await fireEvent.press(getByText('settings.communication.who_can_message'));
    await fireEvent.press(
      getByText(
        'settings.communication.who_can_message:settings.options.no_one'
      )
    );
    await fireEvent.press(getByText('settings.communication.read_receipts'));
    await fireEvent.changeText(getByLabelText('auto-reply-input'), 'Later');
    await fireEvent(getByLabelText('auto-reply-input'), 'submitEditing');

    expect(mockGoBack).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockUpdateCommunicationSettings).toHaveBeenCalledWith({
        whoCanMessage: 'no_one',
      });
      expect(mockUpdateCommunicationSettings).toHaveBeenCalledWith({
        showReadReceipts: false,
      });
      expect(mockUpdateCommunicationSettings).toHaveBeenCalledWith({
        autoReplyMessage: 'Later',
      });
    });
  });

  it('uses upgrade prompt for restricted communication controls', async () => {
    mockFeatureAccess = false;

    const { getByText } = await render(
      <CommunicationSettingsScreen
        navigation={{ goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(
      getByText('settings.communication.auto_reply_enabled')
    );
    await fireEvent.press(getByText('settings.communication.who_can_call'));

    expect(mockShowUpgradePrompt).toHaveBeenCalledWith(
      'settings.communication.auto_reply'
    );
    expect(mockShowUpgradePrompt).toHaveBeenCalledWith(
      'settings.communication.calls'
    );
    expect(mockUpdateCommunicationSettings).not.toHaveBeenCalled();
  });
});
