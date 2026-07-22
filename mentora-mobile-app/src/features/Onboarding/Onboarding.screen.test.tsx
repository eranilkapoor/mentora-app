import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockNavigate = jest.fn();
const mockValidateBasic = jest.fn();
const mockValidatePreferences = jest.fn();
const mockHandleSubmit = jest.fn();
const mockSetBasicField = jest.fn();
const mockSetPreferenceField = jest.fn();
const mockPickImage = jest.fn();
const mockSetPrimaryPhoto = jest.fn();
const mockRemovePhoto = jest.fn();
const mockClearAllErrors = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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

jest.mock('@/core/theme/useThemedStyles', () => ({
  useThemedStyles: () => ({}),
}));

jest.mock('@/core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: { colors: new Proxy({}, { get: () => '#111827' }) },
  }),
}));

jest.mock('./components/StepIndicator', () => {
  const { Text } = require('react-native');
  return {
    StepIndicator: ({ currentStep }: { currentStep: string }) => (
      <Text>{`step:${currentStep}`}</Text>
    ),
  };
});

jest.mock('./steps/BasicStep', () => {
  const { Pressable, Text } = require('react-native');
  return {
    BasicStep: ({
      onSetField,
    }: {
      onSetField: (field: string, value: string) => void;
    }) => (
      <Pressable onPress={() => onSetField('firstName', 'Asha')}>
        <Text>basic-step</Text>
      </Pressable>
    ),
  };
});

jest.mock('./steps/PreferencesStep', () => {
  const { Pressable, Text } = require('react-native');
  return {
    PreferencesStep: ({
      onSetField,
    }: {
      onSetField: (field: string, value: string) => void;
    }) => (
      <Pressable onPress={() => onSetField('city', 'Delhi')}>
        <Text>preferences-step</Text>
      </Pressable>
    ),
  };
});

jest.mock('./steps/PhotosStep', () => {
  const { Pressable, Text } = require('react-native');
  return {
    PhotosStep: ({
      onPickImage,
      onSetPrimary,
      onRemove,
    }: {
      onPickImage: () => void;
      onSetPrimary: (id: string) => void;
      onRemove: (id: string) => void;
    }) => (
      <>
        <Pressable onPress={onPickImage}>
          <Text>pick-onboarding-photo</Text>
        </Pressable>
        <Pressable onPress={() => onSetPrimary('photo-1')}>
          <Text>primary-onboarding-photo</Text>
        </Pressable>
        <Pressable onPress={() => onRemove('photo-1')}>
          <Text>remove-onboarding-photo</Text>
        </Pressable>
      </>
    ),
  };
});

jest.mock('./hooks/useOnboardingForm', () => ({
  useOnboardingForm: () => ({
    basic: {},
    preferences: {},
    photos: [{ id: 'photo-1' }],
    errors: {},
    loading: false,
    setBasicField: mockSetBasicField,
    setPreferenceField: mockSetPreferenceField,
    pickImage: mockPickImage,
    setPrimaryPhoto: mockSetPrimaryPhoto,
    removePhoto: mockRemovePhoto,
    validateBasic: mockValidateBasic,
    validatePreferences: mockValidatePreferences,
    handleSubmit: mockHandleSubmit,
    clearError: jest.fn(),
    clearAllErrors: mockClearAllErrors,
  }),
}));

import OnboardingScreen from './Onboarding.screen';

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateBasic.mockReturnValue(true);
    mockValidatePreferences.mockReturnValue(true);
    mockHandleSubmit.mockResolvedValue(true);
  });

  it('moves through steps and submits successful onboarding', async () => {
    const { getByText } = await render(<OnboardingScreen />);

    expect(getByText('step:basic')).toBeTruthy();
    await fireEvent.press(getByText('basic-step'));
    await fireEvent.press(getByText('onboarding.nav.next'));

    expect(getByText('step:preferences')).toBeTruthy();
    await fireEvent.press(getByText('preferences-step'));
    await fireEvent.press(getByText('onboarding.nav.next'));

    expect(getByText('step:photos')).toBeTruthy();
    await fireEvent.press(getByText('pick-onboarding-photo'));
    await fireEvent.press(getByText('primary-onboarding-photo'));
    await fireEvent.press(getByText('remove-onboarding-photo'));
    await fireEvent.press(getByText('onboarding.nav.submit'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingSuccess');
    });

    expect(mockSetBasicField).toHaveBeenCalledWith('firstName', 'Asha');
    expect(mockSetPreferenceField).toHaveBeenCalledWith('city', 'Delhi');
    expect(mockPickImage).toHaveBeenCalled();
    expect(mockSetPrimaryPhoto).toHaveBeenCalledWith('photo-1');
    expect(mockRemovePhoto).toHaveBeenCalledWith('photo-1');
    expect(mockClearAllErrors).toHaveBeenCalledTimes(2);
  });
});
