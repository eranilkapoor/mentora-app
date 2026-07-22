import Feather from 'react-native-vector-icons/Feather';
import React from 'react';
import { AuthNavigationProp } from '@/navigation/types';

export interface ResetPasswordScreenProps {
  navigation: AuthNavigationProp;
  route: { params?: { code?: string } };
}

export interface FormErrors {
  password?: string;
  confirmPassword?: string;
  error?: string;
}

export interface SocialButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor?: string;
}

export interface CountryCodeDropdownProps {
  visible: boolean;
  onClose: () => void;
  selectedCode: string;
  onSelectCode: (code: string) => void;
}

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
