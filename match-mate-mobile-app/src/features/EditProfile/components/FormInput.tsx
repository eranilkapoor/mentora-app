import React, { useMemo } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface FormInputProps extends Omit<
  TextInputProps,
  'style' | 'onChange' | 'onChangeText'
> {
  label?: string;
  value?: string;
  onChange: (value: string) => void;

  /**
   * Input configuration
   */
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;

  /**
   * Validation & helper
   */
  error?: string;
  helperText?: string;
  required?: boolean;

  /**
   * Styling overrides
   */
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;

  /**
   * Optional adornments
   */
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function FormInput({
  label,
  value,
  onChange,

  placeholder,
  multiline = false,
  editable = true,
  keyboardType = 'default',

  error,
  helperText,
  required = false,

  containerStyle,
  inputStyle,
  labelStyle,

  leftElement,
  rightElement,

  numberOfLines,
  autoCapitalize = 'sentences',
  autoCorrect = false,
  returnKeyType = 'done',

  ...rest
}: FormInputProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
        },

        labelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
          gap: 4,
        },

        label: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        required: {
          color: theme.colors.error,
          fontSize: 13,
          fontWeight: '700',
        },

        inputWrapper: {
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',

          borderWidth: 1,
          borderColor: error ? theme.colors.error : theme.colors.border,

          borderRadius: 12,
          backgroundColor: editable
            ? theme.colors.inputBackground
            : theme.colors.backgroundLight,

          paddingHorizontal: 12,
          minHeight: multiline ? 100 : 48,
        },

        inputWrapperDisabled: {
          opacity: 0.6,
        },

        input: {
          flex: 1,
          fontSize: 15,
          color: theme.colors.textPrimary,

          paddingVertical: multiline ? 12 : 10,
        },

        multilineInput: {
          minHeight: 90,
          textAlignVertical: 'top',
        },

        sideElement: {
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: 2,
          paddingTop: multiline ? 12 : 0,
        },

        helperText: {
          marginTop: 6,
          fontSize: 12,
          color: theme.colors.textMuted,
          lineHeight: 16,
        },

        errorText: {
          marginTop: 6,
          fontSize: 12,
          color: theme.colors.error,
          lineHeight: 16,
        },
      }),
    [theme, error, editable, multiline]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>

          {required ? <Text style={styles.required}>*</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineInput,
          !editable && styles.inputWrapperDisabled,
        ]}
      >
        {leftElement ? (
          <View style={styles.sideElement}>{leftElement}</View>
        ) : null}

        <TextInput
          value={value ?? ''}
          onChangeText={onChange}
          editable={editable}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          numberOfLines={multiline ? (numberOfLines ?? 4) : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.input, multiline && styles.multilineInput, inputStyle]}
          accessibilityLabel={label}
          accessibilityState={{
            disabled: !editable,
          }}
          {...rest}
        />

        {rightElement ? (
          <View style={styles.sideElement}>{rightElement}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

FormInput.displayName = 'FormInput';
