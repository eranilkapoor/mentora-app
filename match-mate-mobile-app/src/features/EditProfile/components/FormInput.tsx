import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';

export interface FormInputProps {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  editable?: boolean;
}

export function FormInput({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  keyboardType = 'default',
  editable = true,
}: FormInputProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    field: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
    multilineInput: {
      minHeight: 90,
      paddingTop: 12,
    },
    inputDisabled: {
      opacity: 0.5,
    }
  });

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          !editable && styles.inputDisabled,
        ]}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType={keyboardType}
        editable={editable}
        textAlignVertical={multiline ? 'top' : 'auto'}
        accessibilityLabel={label}
      />
    </View>
  );
}
