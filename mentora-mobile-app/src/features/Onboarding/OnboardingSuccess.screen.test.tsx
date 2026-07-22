import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockDispatch = jest.fn();
const mockSetProfileCompleted = jest.fn((value: boolean) => ({
  type: 'auth/setProfileCompleted',
  payload: value,
}));
const mockSetPostOnboardingTarget = jest.fn((value: string) => ({
  type: 'settings/setPostOnboardingTarget',
  payload: value,
}));
const mockSetOnboardingCompletionPending = jest.fn((value: boolean) => ({
  type: 'settings/setOnboardingCompletionPending',
  payload: value,
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

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/store/services/baseApi.service', () => ({
  baseApi: {
    util: {
      invalidateTags: (tags: string[]) => ({
        type: 'api/invalidate',
        payload: tags,
      }),
    },
  },
}));

jest.mock('@/store/slices/auth.slice', () => ({
  setProfileCompleted: (value: boolean) => mockSetProfileCompleted(value),
  setPostOnboardingTarget: (value: string) =>
    mockSetPostOnboardingTarget(value),
  setOnboardingCompletionPending: (value: boolean) =>
    mockSetOnboardingCompletionPending(value),
}));

import OnboardingSuccessScreen from './OnboardingSuccess.screen';

describe('OnboardingSuccessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores the selected post-onboarding target', async () => {
    const { getByText } = await render(<OnboardingSuccessScreen />);

    await fireEvent.press(getByText('onboarding.success.cta_complete_profile'));
    await fireEvent.press(getByText('onboarding.success.cta_schedule'));

    expect(mockSetPostOnboardingTarget).toHaveBeenCalledWith('EditProfile');
    expect(mockSetPostOnboardingTarget).toHaveBeenCalledWith('Schedule');
    expect(mockSetProfileCompleted).toHaveBeenCalledWith(true);
    expect(mockSetOnboardingCompletionPending).toHaveBeenCalledWith(false);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'api/invalidate',
      payload: ['Auth', 'Profile', 'Preference'],
    });
  });
});
