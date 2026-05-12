import { PASSWORD_MIN_LENGTH } from '@/core/constants';
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

export const validatePasswords = (
  values: FormValues,
  t: (key: string, params?: Record<string, unknown>) => string
): FormErrors => {
  const errors: FormErrors = {};

  if (!values.oldPassword) {
    errors.oldPassword = t('change_password.errors.current_required');
  }

  if (!values.newPassword) {
    errors.newPassword = t('change_password.errors.new_required');
  } else if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = t('change_password.errors.min_length', {
      count: PASSWORD_MIN_LENGTH,
    });
  } else if (values.newPassword === values.oldPassword) {
    errors.newPassword = t('change_password.errors.must_differ');
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = t('change_password.errors.confirm_required');
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = t('change_password.errors.mismatch');
  }

  return errors;
};
