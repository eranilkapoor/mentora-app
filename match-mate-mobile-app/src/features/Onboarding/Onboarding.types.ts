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

export interface OptionType {
  label: string;
  value: string;
}

export interface DropdownPickerProps {
  label: string;
  options: readonly OptionType[];
  value?: string;
  onChange: (value: string) => void;

  field: string;

  errors: Record<string, string | undefined>;

  onClearError: (field: string) => void;

  showDropdown: string | null;

  onSetShowDropdown: (field: string | null) => void;
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

  options: readonly OptionType[];

  selected: string[];

  onChange: (values: string[]) => void;

  field: string;

  errors: Record<string, string>;

  placeholder?: string;
}
