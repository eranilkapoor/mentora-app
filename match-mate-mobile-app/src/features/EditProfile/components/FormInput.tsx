import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { FormInputProps } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfileScreen.styles';
import { TextInput, View, Text } from 'react-native';
import { Colors } from '@/core/constants/colors';

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
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        editable={editable}
        textAlignVertical={multiline ? 'top' : 'auto'}
        accessibilityLabel={label}
      />
    </View>
  );
}
