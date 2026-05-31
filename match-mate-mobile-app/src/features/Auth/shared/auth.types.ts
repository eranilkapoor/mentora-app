import { AuthNavigationProp } from '@/navigation/types';
import Feather from 'react-native-vector-icons/Feather';
import React from 'react';

export type ActiveTab = 'email' | 'phone';
export type SocialProvider = 'google' | 'apple' | 'facebook';

export interface FormErrors {
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
  referralCode?: string;
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

export interface EmailFormProps {
  errors: FormErrors;
  loading: boolean;
  onSubmit: () => void;
  onNavigateForgot: () => void;
  email: string;
  password: string;
  showPassword: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onTogglePassword: () => void;
}

export interface PhoneFormProps {
  errors: FormErrors;
  loading: boolean;
  phone: string;
  otp: string;
  otpSent: boolean;
  countryCode: string;
  showCountryCodeDropdown: boolean;
  submitLabel: string;
  verifyLabel: string;
  onPhoneChange: (v: string) => void;
  onOtpChange: (v: string) => void;
  onGetOtp: () => void;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
  onToggleDropdown: () => void;
  onCloseDropdown: () => void;
  onSelectCountryCode: (code: string) => void;
  referralCode?: string;
  showReferralCode?: boolean;
  onReferralCodeChange?: (v: string) => void;
  onToggleReferralCode?: () => void;
}

export const TAB_LABEL_KEYS: Record<ActiveTab, string> = {
  email: 'auth.tabs.email',
  phone: 'auth.tabs.phone',
};

export interface LoginScreenProps {
  navigation: AuthNavigationProp;
}

export interface RegisterScreenProps {
  navigation: AuthNavigationProp;
}
