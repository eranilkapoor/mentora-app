import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { authSharedStyles } from '../auth.styles';

interface AuthTextFieldProps extends Omit<
  TextInputProps,
  'style' | 'value' | 'onChange' | 'onChangeText' | 'editable'
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  placeholder?: string | undefined;
  icon?: React.ComponentProps<typeof Feather>['name'] | undefined;
  disabled?: boolean | undefined;
  secure?: boolean;
  secureVisible?: boolean;
  keyboardType?: KeyboardTypeOptions;
  labelSpacing?: boolean;
  onToggleSecure?: (() => void) | undefined;
  showSecureLabel?: string | undefined;
  hideSecureLabel?: string | undefined;
}

export function AuthTextField({
  label,
  value,
  onChange,
  error,
  placeholder,
  icon,
  disabled = false,
  secure = false,
  secureVisible = false,
  keyboardType = 'default',
  labelSpacing = false,
  onToggleSecure,
  showSecureLabel = 'Show password',
  hideSecureLabel = 'Hide password',
  accessibilityLabel,
  onFocus,
  onBlur,
  ...rest
}: AuthTextFieldProps): React.ReactElement {
  const styles = useThemedStyles(authSharedStyles);
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const iconColor = error
    ? theme.colors.error
    : focused
      ? theme.colors.primary
      : theme.colors.textMuted;

  return (
    <>
      <Text style={[styles.label, labelSpacing && styles.labelSpacing]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {icon ? (
          <Feather
            name={icon}
            size={16}
            color={iconColor}
            style={styles.inputIcon}
          />
        ) : null}

        <TextInput
          {...rest}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secure && !secureVisible}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          accessibilityLabel={accessibilityLabel ?? label}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />

        {secure && onToggleSecure ? (
          <TouchableOpacity
            onPress={onToggleSecure}
            style={styles.eyeButton}
            disabled={disabled}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              secureVisible ? hideSecureLabel : showSecureLabel
            }
          >
            <Feather
              name={secureVisible ? 'eye-off' : 'eye'}
              size={18}
              color={iconColor}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );
}

AuthTextField.displayName = 'AuthTextField';
