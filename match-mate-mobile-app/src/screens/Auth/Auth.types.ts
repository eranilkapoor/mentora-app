import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type RootStackParamList } from '../../navigation/types';

export type LoginScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
export type RegisterScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
export type ForgotPasswordScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

export interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
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
  icon: string;
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
