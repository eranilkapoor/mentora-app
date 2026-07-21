import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn();
const mockDeactivateAccount = jest.fn();
const mockReactivateAccount = jest.fn();
const mockDeleteAccountRequest = jest.fn();
const mockCancelDeleteAccountRequest = jest.fn();
const mockClearRefreshToken = jest.fn();
const mockShowSuccess = jest.fn();

type ConfirmParams = {
  title?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

const mockShowConfirm: jest.Mock<void, [ConfirmParams]> = jest.fn();

let mockAccountData: unknown;
let mockAccountLoading = false;

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

jest.mock('@/core/components/settings/VerificationStatusRow', () => {
  const { Text, View } = require('react-native');
  return {
    VerificationStatusRow: ({
      label,
      verified,
    }: {
      label: string;
      verified: boolean;
    }) => (
      <View>
        <Text>{label}</Text>
        <Text>{verified ? 'verified' : 'not-verified'}</Text>
      </View>
    ),
  };
});

jest.mock('@/core/utils/confirm', () => ({
  showConfirm: (params: ConfirmParams) => mockShowConfirm(params),
}));

jest.mock('@/core/utils/toast', () => ({
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/store/slices/auth.slice', () => ({
  logout: () => ({ type: 'auth/logout' }),
}));

jest.mock('@/store/services/baseApi.service', () => ({
  clearRefreshToken: () => mockClearRefreshToken(),
  baseApi: { util: { resetApiState: () => ({ type: 'api/reset' }) } },
}));

jest.mock('@/store/services/accountSettingsApi.service', () => ({
  useGetAccountSettingsQuery: () => ({
    data: mockAccountData,
    isLoading: mockAccountLoading,
  }),
  useDeactivateAccountMutation: () => [mockDeactivateAccount],
  useReactivateAccountMutation: () => [mockReactivateAccount],
  useDeleteAccountRequestMutation: () => [mockDeleteAccountRequest],
  useCancelDeleteAccountRequestMutation: () => [mockCancelDeleteAccountRequest],
}));

import AccountSettingsScreen from './AccountSettings.screen';

describe('AccountSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccountLoading = false;
    mockAccountData = {
      account: {
        emailVerified: true,
        phoneVerified: false,
        profileVerification: { status: 'pending' },
        linkedAccounts: [
          { provider: 'google', connected: true },
          { provider: 'facebook', connected: false },
        ],
        isDeactivated: false,
      },
    };
    mockDeactivateAccount.mockReturnValue({ then: (cb: () => void) => cb() });
    mockReactivateAccount.mockReturnValue({ then: (cb: () => void) => cb() });
    mockDeleteAccountRequest.mockReturnValue({
      then: (cb: () => void) => cb(),
    });
    mockCancelDeleteAccountRequest.mockReturnValue({
      then: (cb: () => void) => cb(),
    });
    mockClearRefreshToken.mockResolvedValue(undefined);
  });

  it('shows loading while account settings load', async () => {
    mockAccountLoading = true;

    const { getByText } = await render(
      <AccountSettingsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    expect(getByText('loader')).toBeTruthy();
  });

  it('navigates account management rows', async () => {
    const { getByText } = await render(
      <AccountSettingsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.account.title'));
    await fireEvent.press(
      getByText('settings.account.profile_kyc_verification')
    );
    await fireEvent.press(getByText('settings.account.change_email'));
    await fireEvent.press(getByText('settings.account.change_phone'));
    await fireEvent.press(getByText('settings.account.change_password'));
    await fireEvent.press(getByText('settings.account.manage_linked_accounts'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('ProfileVerification');
    expect(mockNavigate).toHaveBeenCalledWith('ChangeEmailPhone', {
      mode: 'email',
    });
    expect(mockNavigate).toHaveBeenCalledWith('ChangeEmailPhone', {
      mode: 'phone',
    });
    expect(mockNavigate).toHaveBeenCalledWith('ChangePassword');
    expect(mockNavigate).toHaveBeenCalledWith('LinkedAccounts');
    expect(getByText('1/2')).toBeTruthy();
  });

  it('confirms destructive account actions', async () => {
    const { getByText } = await render(
      <AccountSettingsScreen
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    );

    await fireEvent.press(getByText('settings.account.deactivate'));
    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'settings.account.deactivate_title',
        destructive: true,
      })
    );

    mockShowConfirm.mock.calls[0]?.[0].onConfirm();
    expect(mockDeactivateAccount).toHaveBeenCalledWith({
      reason: 'User requested',
    });
    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'settings.account.deactivate_success',
        })
      );
    });
  });
});
