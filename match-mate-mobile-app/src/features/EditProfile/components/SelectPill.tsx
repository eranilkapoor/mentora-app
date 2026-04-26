import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SelectPillProps } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfile.styles';

export function SelectPill({
  label,
  options,
  value,
  onChange,
  i18nPrefix,
}: SelectPillProps): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.pillRow}>
        {options.map((opt) => {
          const selected = value === opt;
          // Use i18n key if prefix provided, else humanise the snake_case value
          const label = i18nPrefix
            ? t(`${i18nPrefix}.${opt}`)
            : opt.replace(/_/g, ' ');

          return (
            <TouchableOpacity
              key={opt}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => onChange(opt)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={label}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}