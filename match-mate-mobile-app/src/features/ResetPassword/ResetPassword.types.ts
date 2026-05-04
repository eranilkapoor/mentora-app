import Feather from 'react-native-vector-icons/Feather';
import React from 'react';
import { AuthNavigationProp } from '@/navigation/types';


export interface ResetPasswordScreenProps {
  navigation: AuthNavigationProp;
  route: { params: { accessToken: string } };
}

export type ActiveTab = 'email' | 'phone';
export type SocialProvider = 'google' | 'apple' | 'facebook';

export interface FormErrors {
  password?: string;
  confirmPassword?: string;
  error?: string;
}

export interface SocialButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  // Properly typed instead of plain string
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor?: string;
}

export interface CountryCodeDropdownProps {
  visible: boolean;
  onClose: () => void;
  selectedCode: string;
  onSelectCode: (code: string) => void;
}

export type RegistrationStep =
  | 'personal'
  | 'physical'
  | 'education'
  | 'family'
  | 'preferences'
  | 'photos'
  | 'review';

export type Gender = 'male' | 'female' | 'other';

export interface DropdownPickerProps {
  label: string;
  options: string[];
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
