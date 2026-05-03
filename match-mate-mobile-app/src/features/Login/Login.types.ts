import { AuthNavigationProp } from '@/navigation/types';
import Feather from 'react-native-vector-icons/Feather';
import React from 'react';

export interface LoginScreenProps {
  navigation: AuthNavigationProp;
}

export type ActiveTab = 'email' | 'phone';
export type SocialProvider = 'google' | 'apple' | 'facebook';

export interface FormErrors {
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
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
