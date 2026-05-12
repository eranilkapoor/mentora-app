import React, { useCallback } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { editPreferenceStyles } from '../EditPreference.styles';

export interface OptionType {
  value: string;
  label: string;
}

export interface MultiSelectPillProps {
  label: string;
  options: readonly OptionType[];
  value?: string[];
  onChange: (value: string[]) => void;
  i18nPrefix?: string;
}

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
    (selectedValue: string): void => {
      const next = value.includes(selectedValue)
        ? value.filter((v) => v !== selectedValue)
        : [...value, selectedValue];

      onChange(next);
    },
    [onChange, value]
  );

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <Text style={styles.fieldSublabel}>
        {t('preference.multi_select_hint')}
      </Text>

      <View style={styles.pillRow}>
        {options.map((option: OptionType) => {
          const selected = value.includes(option.value);

          const displayLabel = i18nPrefix
            ? t(`${i18nPrefix}.${option.value}`)
            : option.label;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.pill, selected ? styles.pillSelected : null]}
              onPress={() => toggle(option.value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={displayLabel}
            >
              <Text
                style={[
                  styles.pillText,
                  selected ? styles.pillTextSelected : null,
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
