import React from 'react';
import Feather from 'react-native-vector-icons/Feather';

export type OnboardingSteps = 'basic' | 'preferences' | 'photos';

export const ONBOARDING_STEPS: OnboardingSteps[] = [
  'basic',
  'preferences',
  'photos',
];

// Properly typed instead of plain string
export const ONBOARDING_STEPS_ICONS: Record<
  OnboardingSteps,
  React.ComponentProps<typeof Feather>['name']
> = {
  basic: 'user',
  preferences: 'heart',
  photos: 'camera',
};

export interface ProfileImage {
  uri: string;
  isPrimary?: boolean;
}
