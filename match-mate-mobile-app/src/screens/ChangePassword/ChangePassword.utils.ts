import { FormValues, FormErrors } from './ChangePassword.types';
import { PASSWORD_MIN_LENGTH } from '@/core/constants';

export const validatePasswords = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  if (!values.oldPassword) {
    errors.oldPassword = 'Current password is required';
  }

  if (!values.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  } else if (values.newPassword === values.oldPassword) {
    errors.newPassword = 'New password must differ from current password';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};
