import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockRefetch = jest.fn();
const mockSetupTotp = jest.fn();
const mockEnableTotp = jest.fn();
const mockRequestSms = jest.fn();
const mockEnableSms = jest.fn();
const mockDisableTwoFactor = jest.fn();
const mockRegenerateRecoveryCodes = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

let mockTwoFactorData: unknown;
let mockTwoFactorLoading = false;
let mockSetupData: unknown;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

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
    fontScale: 1,
    accessibility: {},
  }),
}));

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/theme/accessibilityStyles', () => ({
  applyAccessibilityToStyles: (styles: unknown) => styles,
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
      onPress,
    }: {
      label: string;
      onPress: () => void;
    }) => (
      <Pressable onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/core/utils/toast', () => ({
  showError: (params: unknown) => mockShowError(params),
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

jest.mock('@/store/services/securitySettingsApi.service', () => ({
  useGetTwoFactorStatusQuery: () => ({
    data: mockTwoFactorData,
    isLoading: mockTwoFactorLoading,
    refetch: mockRefetch,
  }),
  useSetupTotpMutation: () => [mockSetupTotp, { data: mockSetupData }],
  useEnableTotpMutation: () => [mockEnableTotp],
  useRequestSmsTwoFactorMutation: () => [mockRequestSms],
  useEnableSmsTwoFactorMutation: () => [mockEnableSms],
  useDisableTwoFactorMutation: () => [mockDisableTwoFactor],
  useRegenerateRecoveryCodesMutation: () => [mockRegenerateRecoveryCodes],
}));

import TwoFactorSetupScreen from './TwoFactorSetup.screen';

describe('TwoFactorSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTwoFactorLoading = false;
    mockTwoFactorData = {
      enabled: true,
      method: 'authenticator',
      authenticatorConfigured: true,
      recoveryCodesRemaining: 2,
    };
    mockSetupData = { data: { secret: 'SECRET-1' } };
    mockSetupTotp.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    mockEnableTotp.mockReturnValue({
      unwrap: () => Promise.resolve({ enabled: true, recoveryCodes: ['abc'] }),
    });
    mockRequestSms.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockEnableSms.mockReturnValue({
      unwrap: () => Promise.resolve({ enabled: true, recoveryCodes: ['sms'] }),
    });
    mockDisableTwoFactor.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    mockRegenerateRecoveryCodes.mockReturnValue({
      unwrap: () => Promise.resolve({ recoveryCodes: ['new-code'] }),
    });
  });

  it('enables TOTP and SMS, disables 2FA, and regenerates recovery codes', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <TwoFactorSetupScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.two_factor.title'));
    await fireEvent.press(getByText('settings.two_factor.start_authenticator'));
    await fireEvent.changeText(
      getByPlaceholderText('settings.two_factor.six_digit_code'),
      '123456'
    );
    await fireEvent.press(
      getByText('settings.two_factor.enable_authenticator')
    );
    await fireEvent.press(getByText('settings.two_factor.send_sms_otp'));
    await fireEvent.changeText(
      getByPlaceholderText('settings.two_factor.sms_otp'),
      '654321'
    );
    await fireEvent.press(getByText('settings.two_factor.enable_sms'));
    await fireEvent.changeText(
      getByPlaceholderText('settings.two_factor.authenticator_code'),
      '111222'
    );
    await fireEvent.press(
      getByText('settings.two_factor.regenerate_recovery_codes')
    );
    await fireEvent.changeText(
      getByPlaceholderText('settings.two_factor.authenticator_code_optional'),
      '222333'
    );
    await fireEvent.press(getByText('settings.two_factor.disable_action'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockSetupTotp).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockEnableTotp).toHaveBeenCalledWith({ code: '123456' });
      expect(mockRequestSms).toHaveBeenCalled();
      expect(mockEnableSms).toHaveBeenCalledWith({ code: '654321' });
      expect(mockRegenerateRecoveryCodes).toHaveBeenCalledWith({
        code: '111222',
      });
      expect(mockDisableTwoFactor).toHaveBeenCalledWith({ code: '222333' });
      expect(mockShowSuccess).toHaveBeenCalledWith({
        title: 'settings.two_factor.disabled_title',
      });
    });
  });
});
