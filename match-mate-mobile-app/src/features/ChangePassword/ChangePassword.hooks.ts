import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChangePasswordMutation } from '@/store/services/authApi';
import {
  FormValues,
  FormErrors,
  validatePasswords,
} from './ChangePassword.types';
import { showError, showSuccess } from '@/core/utils/toast';

export const useChangePassword = () => {
  const { t } = useTranslation();

  const [values, setValues] = useState<FormValues>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [visibility, setVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [changePassword] = useChangePasswordMutation();

  const setValue = useCallback((field: keyof FormValues, text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const toggleVisibility = useCallback((field: keyof typeof visibility) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleReset = useCallback(() => {
    setValues({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setVisibility({
      oldPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validatePasswords(values, t);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }).unwrap();

      // ✅ Show success toast
      showSuccess({
        title: t('change_password.success.title') || 'Success',
        message:
          t('change_password.success.message') ||
          'Password changed successfully',
        position: 'bottom',
        visibilityTime: 2500,
      });

      // Reset form immediately
      handleReset();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('common.something_went_wrong');

      if (message.toLowerCase().includes('incorrect')) {
        setErrors({
          oldPassword: t('change_password.errors.incorrect_current'),
        });
      } else {
        // ❌ Error toast
        showError({
          title: t('common.error') || 'Error',
          message: message,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [values, changePassword, t, handleReset]);

  return {
    values,
    errors,
    visibility,
    loading,
    setValue,
    toggleVisibility,
    handleSubmit,
    handleReset,
  };
};
