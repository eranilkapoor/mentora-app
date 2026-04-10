import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useChangePasswordMutation } from '../../store/services/authApi';
import { validatePasswords } from './ChangePassword.utils';
import { FormValues, FormErrors } from './ChangePassword.types';

export const useChangePassword = (navigation: any) => {
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
    const validationErrors = validatePasswords(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();

      Alert.alert('Success', 'Password updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      if (error?.message?.toLowerCase().includes('incorrect')) {
        setErrors({ oldPassword: 'Current password is incorrect' });
      } else {
        Alert.alert(
          'Error',
          error?.message ?? 'Something went wrong'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [values, navigation, changePassword]);

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