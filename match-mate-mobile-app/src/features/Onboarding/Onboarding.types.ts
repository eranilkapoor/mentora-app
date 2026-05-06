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

export type Option = {
  label: string;
  value: string;
};

export interface DropdownPickerProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  field: string;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
  showDropdown: string | null;
  onSetShowDropdown: (val: string | null) => void;
}

export interface ErrorTextProps {
  field: string;
  errors: Record<string, string>;
}

export interface ProfileImage {
  uri: string;
  isPrimary?: boolean;
}

export interface SearchMultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  field: string;
  errors: Record<string, string>;
}
