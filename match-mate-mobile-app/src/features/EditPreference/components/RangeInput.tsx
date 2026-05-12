import React, { useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';

export interface Range {
  min: number;
  max: number;
}

export interface RangeInputProps {
  label: string;
  value?: Range;
  onChange: (v: Range) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export function RangeInput({
  label,
  value,
  onChange,
  min,
  max,
  unit,
}: RangeInputProps): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    field: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    fieldSublabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    rangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 4,
    },
    rangeInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
      textAlign: 'center',
    },
    rangeSeparator: {
      fontSize: 18,
      color: theme.colors.textMuted,
      fontWeight: '300',
    },
    rangeUnit: {
      fontSize: 11,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: 4,
    },
    rangeHalfWrapper: {
      flex: 1,
      alignItems: 'stretch',
    },
    rangeHalfLabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginBottom: 4,
      textAlign: 'center',
    },
  });

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
