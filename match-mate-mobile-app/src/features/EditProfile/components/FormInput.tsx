import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { FormInputProps } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfile.styles';

export function FormInput({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  keyboardType = 'default',
  editable = true,
}: FormInputProps): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { theme } = useTheme();

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