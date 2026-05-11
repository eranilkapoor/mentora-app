import React, { useCallback } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { editPreferenceStyles } from '../EditPreference.styles';

type OptionType = {
  label: string;
  value: string;
};

interface Props {
  label: string;
  options: readonly OptionType[];
  value?: string;
  onChange: (v: string) => void;
  i18nPrefix?: string;
}

export function SingleSelectPill({
  label,
  options,
  value,
  onChange,
  i18nPrefix,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editPreferenceStyles);
  const { t } = useTranslation();

  const handlePress = useCallback(
    (opt: string) => {
      onChange(opt);
    },
    [onChange]
  );

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
              onPress={() => handlePress(opt.value)}
              accessibilityRole="radio"
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
