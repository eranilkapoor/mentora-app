import React, { useCallback } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { editPreferenceStyles } from '../EditPreference.styles';

interface Props {
  label: string;
  options: readonly string[];
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
        {options.map((opt) => {
          const selected = value === opt;
          const displayLabel = i18nPrefix
            ? t(`${i18nPrefix}.${opt}`)
            : opt.replace(/_/g, ' ');

          return (
            <TouchableOpacity
              key={opt}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => handlePress(opt)}
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
