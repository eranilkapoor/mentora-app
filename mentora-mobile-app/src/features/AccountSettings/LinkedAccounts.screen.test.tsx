import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDisconnectProvider = jest.fn();
const mockConnectSocialProvider = jest.fn();
const mockSetPrimary = jest.fn();
const mockSignInWithProvider = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
const mockShowWarning = jest.fn();

type ConfirmParams = {
  title?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

const mockShowConfirm: jest.Mock<void, [ConfirmParams]> = jest.fn();

let mockAccountData: unknown;
let mockAccountLoading = false;
let mockConnecting = false;

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

jest.mock('@/core/components/settings/SettingsSelectItem', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    SettingsSelectItem: ({
      label,
      value,
      disabled,
      onPress,
      actionAccessibilityLabel,
      onActionPress,
    }: {
      label: string;
      value?: string;
      disabled?: boolean;
      onPress: () => void;
      actionAccessibilityLabel?: string;
      onActionPress?: () => void;
    }) => (
      <View>
        <Pressable disabled={disabled} onPress={onPress}>
          <Text>{label}</Text>
          {value ? <Text>{value}</Text> : null}
        </Pressable>
        {onActionPress ? (
          <Pressable onPress={onActionPress}>
            <Text>{actionAccessibilityLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    ),
  };
});

jest.mock('@/core/utils/confirm', () => ({
  showConfirm: (params: ConfirmParams) => mockShowConfirm(params),
}));

jest.mock('@/core/utils/toast', () => ({
  showError: (params: unknown) => mockShowError(params),
  showSuccess: (params: unknown) => mockShowSuccess(params),
  showWarning: (params: unknown) => mockShowWarning(params),
}));

jest.mock('@/features/Auth/shared/useSocialAuth', () => ({
  useSocialAuth: () => ({ signInWithProvider: mockSignInWithProvider }),
}));

jest.mock('@/features/Auth/shared/authMethodConfig', () => ({
  authMethodConfig: { social: { apple: false } },
}));

jest.mock('@/store/services/accountSettingsApi.service', () => ({
  useGetAccountSettingsQuery: () => ({
    data: mockAccountData,
    isLoading: mockAccountLoading,
  }),
  useDisconnectLinkedAccountMutation: () => [mockDisconnectProvider],
  useConnectSocialLinkedAccountMutation: () => [
    mockConnectSocialProvider,
    { isLoading: mockConnecting },
  ],
  useSetPrimaryLinkedAccountMutation: () => [mockSetPrimary],
}));

import LinkedAccountsScreen from './LinkedAccounts.screen';

describe('LinkedAccountsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccountLoading = false;
    mockConnecting = false;
    mockAccountData = {
      account: {
        linkedAccounts: [
          {
            provider: 'email',
            connected: true,
            isPrimary: true,
            canDisconnect: false,
          },
          {
            provider: 'google',
            connected: true,
            isPrimary: false,
            canDisconnect: true,
          },
          {
            provider: 'facebook',
            connected: false,
            isPrimary: false,
            canDisconnect: false,
          },
        ],
      },
    };
    mockSignInWithProvider.mockResolvedValue({
      accessToken: 'token-1',
      email: 'user@example.com',
      first_name: 'Asha',
    });
    mockConnectSocialProvider.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
  });

  it('connects social accounts and opens email/phone change flows', async () => {
    const { getAllByText, getByText } = await render(
      <LinkedAccountsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.account.provider_facebook'));
    await fireEvent.press(getByText('settings.account.provider_phone'));

    expect(mockNavigate).toHaveBeenCalledWith('ChangeEmailPhone', {
      mode: 'phone',
    });
    expect(
      getAllByText('settings.account.make_primary').length
    ).toBeGreaterThan(0);
    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('facebook');
      expect(mockConnectSocialProvider).toHaveBeenCalledWith({
        provider: 'facebook',
        accessToken: 'token-1',
        email: 'user@example.com',
        first_name: 'Asha',
      });
      expect(mockShowSuccess).toHaveBeenCalled();
    });
  });

  it('confirms primary changes and disconnects linked accounts', async () => {
    const { getAllByText, getByText } = await render(
      <LinkedAccountsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    const makePrimaryRow = getAllByText('settings.account.make_primary')[0];
    if (!makePrimaryRow) {
      throw new Error('Expected make primary row to render');
    }

    await fireEvent.press(makePrimaryRow);
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'settings.account.make_primary_title',
      })
    );

    mockShowConfirm.mock.calls[0]?.[0].onConfirm();
    expect(mockSetPrimary).toHaveBeenCalledWith({ provider: 'google' });

    await fireEvent.press(getByText('settings.account.disconnect_title'));
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'settings.account.disconnect_title',
        destructive: true,
      })
    );

    mockShowConfirm.mock.calls[1]?.[0].onConfirm();
    expect(mockDisconnectProvider).toHaveBeenCalledWith({ provider: 'google' });
  });
});
