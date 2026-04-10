import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type RootStackParamList } from '../../navigation/types';

export type ChangePasswordNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export interface ChangePasswordScreenProps {
  navigation: ChangePasswordNavigationProp;
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