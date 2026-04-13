import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SelectPillProps } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfileScreen.styles';
import { TouchableOpacity, View, Text } from 'react-native';

export function SelectPill({
  label,
  options,
  value,
  onChange,
}: SelectPillProps): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.pillRow}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => onChange(opt)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
            >
              <Text
                style={[styles.pillText, selected && styles.pillTextSelected]}
              >
                {opt.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
