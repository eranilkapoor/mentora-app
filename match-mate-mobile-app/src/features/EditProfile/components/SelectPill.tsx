import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SelectPillProps } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfile.styles';

type OptionType = {
  label: string;
  value: string;
};

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
        {options.map((opt: OptionType) => {
          const selected = value === opt.value;

          const displayLabel = i18nPrefix
            ? t(`${i18nPrefix}.${opt.value}`)
            : opt.label;

          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => onChange(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={displayLabel}
            >
              <Text
                style={[
                  styles.pillText,
                  selected && styles.pillTextSelected,
                ]}
              >
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}