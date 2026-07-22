import React from 'react';

import { useTranslation } from 'react-i18next';
import { AuthTextField } from '@/features/Auth/shared/components/AuthTextField';

interface Props {
  value: string;
  error?: string | undefined;
  loading?: boolean | undefined;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function EmailInputField({
  value,
  error,
  loading,
  onChange,
  onSubmit,
}: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <AuthTextField
      label={t('auth.fields.email')}
      icon="mail"
      value={value}
      onChange={onChange}
      error={error}
      placeholder={t('auth.placeholders.email')}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="email"
      returnKeyType="send"
      onSubmitEditing={onSubmit}
      disabled={loading}
    />
  );
}
