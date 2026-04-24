import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { changePasswordStyles } from '../ChangePassword.styles';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { PasswordFieldProps } from '../ChangePassword.types';

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
  const styles = useThemedStyles(changePasswordStyles);

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
