import React, { memo, useCallback, useMemo } from 'react';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface RangeValue {
  min: number;
  max: number;
}

export interface RangeInputProps {
  label: string;

  value?: RangeValue;

  onChange: (value: RangeValue) => void;

  /**
   * Allowed limits
   */
  minLimit: number;
  maxLimit: number;

  /**
   * Step increment
   * default: 1
   */
  step?: number;

  /**
   * Unit label
   * Example: kg, cm, years
   */
  unit?: string;

  /**
   * Input configs
   */
  keyboardType?: KeyboardTypeOptions;

  /**
   * State
   */
  disabled?: boolean;
  required?: boolean;

  /**
   * Validation
   */
  error?: string;
  helperText?: string;

  /**
   * Labels
   */
  minLabel?: string;
  maxLabel?: string;

  /**
   * Allow empty typing temporarily
   * default: true
   */
  allowEmpty?: boolean;

  /**
   * Styling
   */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;

  /**
   * Accessibility
   */
  accessibilityLabel?: string;
  testID?: string;
}

function RangeInputComponent({
  label,
  value,
  onChange,

  minLimit,
  maxLimit,

  step = 1,
  unit,

  keyboardType = 'numeric',

  disabled = false,
  required = false,

  error,
  helperText,

  minLabel,
  maxLabel,

  allowEmpty = true,

  containerStyle,
  labelStyle,
  inputStyle,

  accessibilityLabel,
  testID,
}: RangeInputProps): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
          opacity: disabled ? 0.6 : 1,
        },

        labelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
        },

        label: {
          flex: 1,
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        required: {
          color: theme.colors.error,
        },

        helper: {
          marginTop: 4,
          fontSize: 11,
          color: theme.colors.textMuted,
        },

        errorText: {
          marginTop: 4,
          fontSize: 11,
          color: theme.colors.error,
        },

        row: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 8,
        },

        rangeBox: {
          flex: 1,
        },

        rangeLabel: {
          marginBottom: 6,
          fontSize: 11,
          fontWeight: '500',
          color: theme.colors.textMuted,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },

        input: {
          borderWidth: 1,
          borderColor: error ? theme.colors.error : theme.colors.border,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontSize: 15,
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.inputBackground,
          textAlign: 'center',
        },

        separator: {
          marginHorizontal: 10,
          marginTop: 22,
          fontSize: 18,
          color: theme.colors.textMuted,
          fontWeight: '300',
        },

        unitText: {
          marginTop: 6,
          fontSize: 11,
          color: theme.colors.textMuted,
          textAlign: 'center',
        },
      }),
    [disabled, error, theme]
  );

  const currentMin = value?.min ?? minLimit;
  const currentMax = value?.max ?? maxLimit;

  const clampValue = useCallback(
    (num: number): number => {
      const stepped = Math.round(num / step) * step;

      return Math.min(Math.max(stepped, minLimit), maxLimit);
    },
    [maxLimit, minLimit, step]
  );

  const parseValue = useCallback(
    (text: string): number | null => {
      if (allowEmpty && text.trim() === '') {
        return null;
      }

      const parsed = Number(text);

      if (Number.isNaN(parsed)) {
        return null;
      }

      return clampValue(parsed);
    },
    [allowEmpty, clampValue]
  );

  const handleMinChange = useCallback(
    (text: string): void => {
      const parsed = parseValue(text);

      if (parsed === null) {
        return;
      }

      const nextMin = Math.min(parsed, currentMax);

      onChange({
        min: nextMin,
        max: currentMax,
      });
    },
    [currentMax, onChange, parseValue]
  );

  const handleMaxChange = useCallback(
    (text: string): void => {
      const parsed = parseValue(text);

      if (parsed === null) {
        return;
      }

      const nextMax = Math.max(parsed, currentMin);

      onChange({
        min: currentMin,
        max: nextMax,
      });
    },
    [currentMin, onChange, parseValue]
  );

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, labelStyle]}>
          {label}

          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      </View>

      {unit ? (
        <Text style={styles.helper}>
          {t('preference.range.unit_hint', {
            unit,
          })}
        </Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}

      <View style={styles.row}>
        <View style={styles.rangeBox}>
          <Text style={styles.rangeLabel}>
            {minLabel ?? t('preference.range.min')}
          </Text>

          <TextInput
            editable={!disabled}
            value={String(currentMin)}
            onChangeText={handleMinChange}
            keyboardType={keyboardType}
            placeholder={String(minLimit)}
            placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel={
              accessibilityLabel
                ? `${accessibilityLabel} minimum`
                : `${label} minimum`
            }
            style={[styles.input, inputStyle]}
            returnKeyType="done"
          />

          {unit ? <Text style={styles.unitText}>{unit}</Text> : null}
        </View>

        <Text style={styles.separator}>—</Text>

        <View style={styles.rangeBox}>
          <Text style={styles.rangeLabel}>
            {maxLabel ?? t('preference.range.max')}
          </Text>

          <TextInput
            editable={!disabled}
            value={String(currentMax)}
            onChangeText={handleMaxChange}
            keyboardType={keyboardType}
            placeholder={String(maxLimit)}
            placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel={
              accessibilityLabel
                ? `${accessibilityLabel} maximum`
                : `${label} maximum`
            }
            style={[styles.input, inputStyle]}
            returnKeyType="done"
          />

          {unit ? <Text style={styles.unitText}>{unit}</Text> : null}
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

RangeInputComponent.displayName = 'RangeInput';

export const RangeInput = memo(
  RangeInputComponent
) as typeof RangeInputComponent;
