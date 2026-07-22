import { AuthNavigationProp } from '@/navigation/types';

export interface ForgotPasswordScreenProps {
  navigation: AuthNavigationProp;
}

export interface FormErrors {
  email?: string;
  error?: string;
}
