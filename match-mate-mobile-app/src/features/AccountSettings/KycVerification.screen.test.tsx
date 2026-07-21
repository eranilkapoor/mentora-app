import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockGoBack = jest.fn();
const mockRefetch = jest.fn();
const mockSubmitKyc = jest.fn();
const mockInitiateEkyc = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
const mockRequestPermission = jest.fn();
const mockLaunchImageLibrary = jest.fn();

let mockKycData: unknown;
let mockKycLoading = false;

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  requestMediaLibraryPermissionsAsync: () => mockRequestPermission(),
  launchImageLibraryAsync: (options: unknown) =>
    mockLaunchImageLibrary(options),
}));

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
      spacing: new Proxy(
        {},
        {
          get: () => 12,
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

jest.mock('@/core/utils/toast', () => ({
  showError: (params: unknown) => mockShowError(params),
  showSuccess: (params: unknown) => mockShowSuccess(params),
}));

jest.mock('@/store/services/kycApi.service', () => ({
  useGetKycStatusQuery: () => ({
    data: mockKycData,
    isLoading: mockKycLoading,
    refetch: mockRefetch,
  }),
  useSubmitKycMutation: () => [mockSubmitKyc, { isLoading: false }],
  useInitiateEkycMutation: () => [mockInitiateEkyc],
}));

import KycVerificationScreen from './KycVerification.screen';

describe('KycVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKycLoading = false;
    mockKycData = { data: { status: 'not_started' } };
    mockRequestPermission.mockResolvedValue({ status: 'granted' });
    mockLaunchImageLibrary.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file://document.jpg',
          fileName: 'document.jpg',
          mimeType: 'image/jpeg',
        },
      ],
    });
    mockSubmitKyc.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
    mockInitiateEkyc.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });
  });

  it('submits manual KYC after selecting both required images', async () => {
    const { getByText } = await render(
      <KycVerificationScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.kyc.document_type'));
    await fireEvent.press(
      getByText('settings.kyc.document_type:settings.kyc.document_pan')
    );
    await fireEvent.press(getByText('settings.kyc.upload_id'));
    await fireEvent.press(getByText('settings.kyc.upload_selfie'));
    await fireEvent.press(getByText('settings.kyc.submit_for_review'));

    await waitFor(() => {
      expect(mockSubmitKyc).toHaveBeenCalledWith(
        expect.objectContaining({
          documentType: 'pan',
          idProof: expect.objectContaining({ name: 'document.jpg' }),
          selfie: expect.objectContaining({ name: 'document.jpg' }),
        })
      );
      expect(mockShowSuccess).toHaveBeenCalledWith({
        title: 'settings.kyc.submitted_title',
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('starts eKYC and validates missing manual documents', async () => {
    const { getByText } = await render(
      <KycVerificationScreen navigation={{ goBack: mockGoBack } as never} />
    );

    await fireEvent.press(getByText('settings.kyc.submit_for_review'));
    await fireEvent.press(getByText('settings.kyc.start_aadhaar'));

    expect(mockShowError).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'settings.kyc.documents_required_title',
      })
    );
    await waitFor(() => {
      expect(mockInitiateEkyc).toHaveBeenCalledWith({ provider: 'aadhaar' });
      expect(mockShowSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'settings.kyc.started_title' })
      );
    });
  });
});
