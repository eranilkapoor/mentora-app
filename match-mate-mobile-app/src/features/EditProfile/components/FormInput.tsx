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
  Platform,
} from 'react-native';

import { useTheme } from '@/core/theme/ThemeProvider';
import { applyAccessibilityToStyles } from '@/core/theme/accessibilityStyles';
import { RequiredAsterisk } from '@/core/components/RequiredAsterisk';
import { sanitizeDigits } from '@/core/utils/inputSanitizers';

export interface FormInputProps extends Omit<
  TextInputProps,
  'style' | 'onChange' | 'onChangeText'
> {
  label?: string;
  value?: string;
  onChange: (value: string) => void;

  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;

  error?: string;
  helperText?: string;
  required?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;

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
  const { theme, fontScale, accessibility } = useTheme();
  const isNumericInput =
    keyboardType === 'numeric' ||
    keyboardType === 'number-pad' ||
    keyboardType === 'phone-pad';
  const handleChangeText = (text: string): void => {
    onChange(isNumericInput ? sanitizeDigits(text) : text);
  };

  const styles = useMemo(
    () =>
      applyAccessibilityToStyles(
        StyleSheet.create({
          container: {
            marginBottom: 16,
            width: '100%',
          },

          labelRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
          },

          label: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.textSecondary,
          },

          inputWrapper: {
            width: '100%',
            minHeight: multiline ? 100 : 48,

            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',

            borderWidth: 1,
            borderRadius: 12,

            borderColor: error ? theme.colors.error : theme.colors.inputBorder,

            backgroundColor: editable
              ? theme.colors.inputBackground
              : theme.colors.backgroundLight,

            overflow: 'hidden',

            ...(Platform.OS === 'web'
              ? ({
                  outlineWidth: 0,
                  outlineStyle: 'none',
                  boxSizing: 'border-box',
                } as never)
              : {}),
          },

          inputWrapperDisabled: {
            opacity: 0.6,
          },

          sideElement: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingTop: multiline ? 12 : 0,
          },

          input: {
            flex: 1,

            minHeight: multiline ? 100 : 48,

            fontSize: 15,
            color: theme.colors.textPrimary,

            paddingHorizontal: 14,
            paddingVertical: multiline ? 12 : 0,

            backgroundColor: theme.colors.transparent,

            ...(Platform.OS === 'web'
              ? ({
                  outlineWidth: 0,
                  outlineStyle: 'none',
                  borderWidth: 0,
                  boxSizing: 'border-box',
                } as never)
              : {}),
          },

          multilineInput: {
            textAlignVertical: 'top',
          },

          helperText: {
            marginTop: 6,
            fontSize: 12,
            lineHeight: 16,
            color: theme.colors.textMuted,
          },

          errorText: {
            marginTop: 6,
            fontSize: 12,
            lineHeight: 16,
            color: theme.colors.error,
          },
        }),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, editable, error, fontScale, multiline, theme]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>

          {required ? <RequiredAsterisk /> : null}
        </View>
      ) : null}

      <View
        style={[styles.inputWrapper, !editable && styles.inputWrapperDisabled]}
      >
        {leftElement ? (
          <View style={styles.sideElement}>{leftElement}</View>
        ) : null}

        <TextInput
          value={value ?? ''}
          onChangeText={handleChangeText}
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
