import React, { useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { RangeInputProps } from '../EditPreference.types';
import { editPreferenceStyles } from '../EditPreference.styles';

export function RangeInput({
  label,
  value,
  onChange,
  min,
  max,
  unit,
}: RangeInputProps): React.ReactElement {
  const styles = useThemedStyles(editPreferenceStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const currentMin = value?.min ?? min;
  const currentMax = value?.max ?? max;

  const handleMinChange = useCallback(
    (text: string) => {
      const parsed = parseInt(text, 10);
      if (isNaN(parsed)) return;
      const clamped = Math.min(Math.max(parsed, min), currentMax);
      onChange({ min: clamped, max: currentMax });
    },
    [currentMax, min, onChange]
  );

  const handleMaxChange = useCallback(
    (text: string) => {
      const parsed = parseInt(text, 10);
      if (isNaN(parsed)) return;
      const clamped = Math.max(Math.min(parsed, max), currentMin);
      onChange({ min: currentMin, max: clamped });
    },
    [currentMin, max, onChange]
  );

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {unit && (
        <Text style={styles.fieldSublabel}>
          {t('preference.range.unit_hint', { unit })}
        </Text>
      )}
      <View style={styles.rangeRow}>
        <View style={styles.rangeHalfWrapper}>
          <Text style={styles.rangeHalfLabel}>{t('preference.range.min')}</Text>
          <TextInput
            style={styles.rangeInput}
            value={String(currentMin)}
            onChangeText={handleMinChange}
            keyboardType="numeric"
            accessibilityLabel={`${label} minimum`}
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <Text style={styles.rangeSeparator}>—</Text>

        <View style={styles.rangeHalfWrapper}>
          <Text style={styles.rangeHalfLabel}>{t('preference.range.max')}</Text>
          <TextInput
            style={styles.rangeInput}
            value={String(currentMax)}
            onChangeText={handleMaxChange}
            keyboardType="numeric"
            accessibilityLabel={`${label} maximum`}
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
      </View>
    </View>
  );
}