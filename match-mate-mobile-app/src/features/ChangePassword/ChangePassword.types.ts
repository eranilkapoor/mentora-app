import { type SettingsNavigationProp } from '../../navigation/types';

export interface ChangePasswordScreenProps {
  navigation: SettingsNavigationProp;
}

export interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface FormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface PasswordFieldProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  visible: boolean;
  onChangeText: (text: string) => void;
  onToggleVisibility: () => void;
  accessibilityLabel: string;
  editable?: boolean;
}
