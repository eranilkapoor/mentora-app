import React from 'react';
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

  const styles = StyleSheet.create({
    fieldWrapper: {
      marginBottom: 4,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
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
      opacity: 0.5,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 5,
    },
    ruleText: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
  });

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          !editable ? styles.inputDisabled : null,
        ]}
      >
        <Feather
          name="lock"
          size={18}
          color={styles.label.color}
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
            color={styles.ruleText.color}
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
