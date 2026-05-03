import React, { useCallback } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { MultiSelectPillProps } from '../EditPreference.types';
import { editPreferenceStyles } from '../EditPreference.styles';

export function MultiSelectPill({
  label,
  options,
  value = [],
  onChange,
  i18nPrefix,
}: MultiSelectPillProps): React.ReactElement {
  const styles = useThemedStyles(editPreferenceStyles);
  const { t } = useTranslation();

  const toggle = useCallback(
    (opt: string) => {
      const next = value.includes(opt)
        ? value.filter((v) => v !== opt)
        : [...value, opt];
      onChange(next);
    },
    [value, onChange]
  );

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldSublabel}>
        {t('preference.multi_select_hint')}
      </Text>
      <View style={styles.pillRow}>
        {options.map((opt) => {
          const selected = value.includes(opt);
          const displayLabel = i18nPrefix
            ? t(`${i18nPrefix}.${opt}`)
            : opt.replace(/_/g, ' ');

          return (
            <TouchableOpacity
              key={opt}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => toggle(opt)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={displayLabel}
            >
              <Text
                style={[styles.pillText, selected && styles.pillTextSelected]}
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
