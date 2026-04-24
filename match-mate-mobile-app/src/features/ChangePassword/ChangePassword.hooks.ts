import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useChangePasswordMutation } from '../../store/services/authApi';
import { validatePasswords } from './ChangePassword.utils';
import { FormValues, FormErrors } from './ChangePassword.types';

export const useChangePassword = (navigation: any) => {
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
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const toggleVisibility = useCallback((field: keyof typeof visibility) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
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
      }).unwrap();

      Alert.alert(
        t('change_password.success.title'),
        t('change_password.success.message'),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      if (error?.message?.toLowerCase().includes('incorrect')) {
        setErrors({
          oldPassword: t('change_password.errors.incorrect_current'),
        });
      } else {
        Alert.alert(
          t('common.error'),
          error?.message ?? t('common.something_went_wrong')
        );
      }
    } finally {
      setLoading(false);
    }
  }, [values, navigation, changePassword, t]);

  const handleReset = useCallback(() => {
    setValues({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setVisibility({
      oldPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  }, []);

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
