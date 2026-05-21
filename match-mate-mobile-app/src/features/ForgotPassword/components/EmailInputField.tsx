import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { forgotPasswordStyles } from '../ForgotPassword.styles';

interface Props {
  value: string;
  error?: string;
  loading?: boolean;
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
  const styles = useThemedStyles(forgotPasswordStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [focused, setFocused] = useState(false);

  return (
    <>
      <Text style={styles.label}>{t('auth.fields.email')}</Text>

      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        <Feather
          name="mail"
          size={16}
          color={
            error
              ? theme.colors.error
              : focused
                ? theme.colors.primary
                : theme.colors.textMuted
          }
          style={styles.inputIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={t('auth.placeholders.email')}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          style={styles.input}
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={onSubmit}
          accessibilityLabel={t('auth.fields.email')}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );
}
