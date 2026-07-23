import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockUpdateNotificationSettings = jest.fn();
const mockUpdateNotificationChannel = jest.fn();

let mockNotificationData: unknown;
let mockNotificationLoading = false;
let mockUpdating = false;
let mockFeatureAccess = true;

jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-vector-icons/Feather', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
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
      disabled,
      onPress,
    }: {
      label: string;
      value?: string;
      disabled?: boolean;
      onPress: () => void;
    }) => (
      <Pressable disabled={disabled} onPress={onPress}>
        <Text>{label}</Text>
        {value ? <Text>{value}</Text> : null}
      </Pressable>
    ),
  };
});

jest.mock('@/core/components/settings/ChannelPreferenceRow', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    ChannelPreferenceRow: ({
      label,
      onChange,
      onDisabledChannelPress,
    }: {
      label: string;
      onChange: (
        channel: 'push' | 'inApp' | 'email' | 'sms',
        value: boolean
      ) => void;
      onDisabledChannelPress?: (channel: 'email' | 'sms') => void;
    }) => (
      <View>
        <Text>{label}</Text>
        <Pressable onPress={() => onChange('push', false)}>
          <Text>{`${label}:push`}</Text>
        </Pressable>
        <Pressable onPress={() => onDisabledChannelPress?.('email')}>
          <Text>{`${label}:email`}</Text>
        </Pressable>
      </View>
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
          {options.slice(0, 2).map((option) => (
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

jest.mock('@/core/utils/toast', () => ({
  showError: jest.fn(),
}));

jest.mock('../Membership/hooks/usePlanFeatureAccess', () => ({
  usePlanFeatureAccess: () => ({
    hasFeature: mockFeatureAccess,
    isLoading: false,
  }),
}));

jest.mock('@/store/services/notificationSettingsApi.service', () => ({
  useGetNotificationSettingsQuery: () => ({
    data: mockNotificationData,
    isLoading: mockNotificationLoading,
  }),
  useUpdateNotificationSettingsMutation: () => [
    mockUpdateNotificationSettings,
    { isLoading: mockUpdating },
  ],
  useUpdateNotificationChannelMutation: () => [mockUpdateNotificationChannel],
}));

import NotificationSettingsScreen from './NotificationSettings.screen';

describe('NotificationSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationLoading = false;
    mockUpdating = false;
    mockFeatureAccess = true;
    mockNotificationData = {
      notification: {
        inAppEnabled: true,
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        marketingEnabled: false,
        soundEnabled: true,
        vibrationEnabled: false,
        doNotDisturb: false,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00',
          timezone: 'Asia/Kolkata',
        },
        preferences: {},
      },
    };
    mockUpdateNotificationSettings.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
  });

  it('updates global and quiet-hour notification preferences', async () => {
    const { getByLabelText, getByText } = await render(
      <NotificationSettingsScreen
        navigation={
          {
            goBack: mockGoBack,
            getParent: () => ({ navigate: mockNavigate }),
          } as never
        }
      />
    );

    await fireEvent.press(getByText('settings.notification_settings.title'));
    await fireEvent(
      getByLabelText('settings.notifications.all_notifications'),
      'valueChange',
      false
    );
    await fireEvent.press(getByText('settings.notifications.push'));
    await fireEvent.press(getByText('settings.notifications.quiet_start'));
    await fireEvent.press(
      getByText('settings.notifications.quiet_start:00:00')
    );

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(
      expect.objectContaining({ doNotDisturb: true })
    );
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith({
      pushEnabled: false,
    });
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith({
      quietHours: expect.objectContaining({ start: '00:00' }),
    });
  });

  it('updates per-event channels and shows paid-channel prompts', async () => {
    mockFeatureAccess = false;

    const { getByText } = await render(
      <NotificationSettingsScreen
        navigation={
          {
            goBack: mockGoBack,
            getParent: () => ({ navigate: mockNavigate }),
          } as never
        }
      />
    );

    await fireEvent.press(
      getByText('settings.notifications.session_scheduled:push')
    );
    await fireEvent.press(
      getByText('settings.notifications.session_scheduled:email')
    );

    expect(mockUpdateNotificationChannel).toHaveBeenCalledWith({
      event: 'sessionScheduled',
      channel: 'push',
      value: false,
    });
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'settings.notifications.paid_channel_title',
        'settings.notifications.paid_email_message',
        expect.any(Array)
      );
    });
  });
});
