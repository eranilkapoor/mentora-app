import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';

interface PasswordFieldProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string | undefined;
  visible: boolean;
  onChangeText: (text: string) => void;
  onToggleVisibility: () => void;
  accessibilityLabel: string;
  editable?: boolean;
}

export function PasswordField({
  label,
  value,
  placeholder,
  error,
  visible,
  onChangeText,
  onToggleVisibility,
  accessibilityLabel,
  editable = true,
}: PasswordFieldProps): React.ReactElement {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        fieldWrapper: {
          marginBottom: 4,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
          marginBottom: 6,
        },
        inputContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.inputBackground,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.inputBorder,
          paddingHorizontal: 12,
          minHeight: 52,
        },
        inputFocused: {
          borderColor: theme.colors.inputBorder,
        },
        inputIcon: {
          marginRight: 10,
        },
        input: {
          flex: 1,
          minHeight: 48,
          paddingVertical: 13,
          fontSize: 15,
          color: theme.colors.textPrimary,
        },
        eyeButton: {
          padding: 6,
        },
        inputError: {
          borderColor: theme.colors.error,
          backgroundColor: theme.colors.errorLight,
        },
        inputDisabled: {
          opacity: 0.6,
          backgroundColor: theme.colors.backgroundLight,
        },
        errorText: {
          color: theme.colors.error,
          fontSize: 12,
          marginTop: 6,
        },
        ruleText: {
          fontSize: 12,
          color: theme.colors.textMuted,
        },
      }),
    [theme]
  );

  const iconColor = error
    ? theme.colors.error
    : focused
      ? theme.colors.inputBorder
      : theme.colors.textMuted;

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          focused ? styles.inputFocused : null,
          error ? styles.inputError : null,
          !editable ? styles.inputDisabled : null,
        ]}
      >
        <Feather
          name="lock"
          size={18}
          color={iconColor}
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={styles.ruleText.color}
          secureTextEntry={!visible}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          accessibilityLabel={accessibilityLabel}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        <TouchableOpacity
          onPress={onToggleVisibility}
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          disabled={!editable}
        >
          <Feather
            name={visible ? 'eye-off' : 'eye'}
            size={18}
            color={iconColor}
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
