import React, { memo, useCallback, useMemo } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface WeightSliderProps {
  /**
   * Main label
   */
  label: string;

  /**
   * Current value
   */
  value?: number;

  /**
   * Change callback
   */
  onChange: (value: number) => void;

  /**
   * Limits
   */
  min?: number;
  max?: number;

  /**
   * Increment step
   */
  step?: number;

  /**
   * Unit
   * Example: kg, lbs
   */
  unit?: string;

  /**
   * Optional helper text
   */
  helperText?: string;

  /**
   * Validation
   */
  error?: string;

  /**
   * States
   */
  disabled?: boolean;
  required?: boolean;

  /**
   * Accessibility
   */
  accessibilityLabel?: string;
  testID?: string;

  /**
   * Display
   */
  showButtons?: boolean;
  showValue?: boolean;

  /**
   * Styles
   */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  trackStyle?: StyleProp<ViewStyle>;
  fillStyle?: StyleProp<ViewStyle>;
}

interface Styles {
  container: ViewStyle;

  headerRow: ViewStyle;

  labelWrapper: ViewStyle;

  label: TextStyle;

  helperText: TextStyle;

  errorText: TextStyle;

  required: TextStyle;

  controlsRow: ViewStyle;

  button: ViewStyle;

  buttonDisabled: ViewStyle;

  value: TextStyle;

  track: ViewStyle;

  fill: ViewStyle;
}

function WeightSliderComponent({
  label,

  value = 0,

  onChange,

  min = 0,
  max = 100,

  step = 1,

  unit = 'kg',

  helperText,
  error,

  disabled = false,
  required = false,

  accessibilityLabel,
  testID,

  showButtons = true,
  showValue = true,

  containerStyle,
  labelStyle,
  valueStyle,
  trackStyle,
  fillStyle,
}: WeightSliderProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create<Styles>({
        container: {
          marginBottom: 16,
          opacity: disabled ? 0.6 : 1,
        },

        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },

        labelWrapper: {
          flex: 1,
          paddingRight: 12,
        },

        label: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        helperText: {
          marginTop: 4,
          fontSize: 11,
          color: error ? theme.colors.error : theme.colors.textMuted,
        },

        errorText: {
          marginTop: 6,
          fontSize: 11,
          color: theme.colors.error,
        },

        required: {
          color: theme.colors.error,
        },

        controlsRow: {
          flexDirection: 'row',
          alignItems: 'center',
        },

        button: {
          width: 32,
          height: 32,
          borderRadius: 10,

          borderWidth: 1,
          borderColor: theme.colors.border,

          backgroundColor: theme.colors.inputBackground,

          alignItems: 'center',
          justifyContent: 'center',
        },

        buttonDisabled: {
          opacity: 0.4,
        },

        value: {
          minWidth: 64,
          marginHorizontal: 12,

          fontSize: 15,
          fontWeight: '700',

          color: theme.colors.primary,
          textAlign: 'center',
        },

        track: {
          height: 8,
          borderRadius: 999,

          overflow: 'hidden',

          backgroundColor: theme.colors.backgroundLight,
        },

        fill: {
          height: '100%',
          borderRadius: 999,
          backgroundColor: theme.colors.primary,
        },
      }),
    [disabled, error, theme]
  );

  const safeValue = useMemo<number>(() => {
    return Math.min(Math.max(value, min), max);
  }, [max, min, value]);

  const canDecrease = !disabled && safeValue > min;

  const canIncrease = !disabled && safeValue < max;

  const decrease = useCallback((): void => {
    if (!canDecrease) {
      return;
    }

    onChange(Math.max(min, safeValue - step));
  }, [canDecrease, min, onChange, safeValue, step]);

  const increase = useCallback((): void => {
    if (!canIncrease) {
      return;
    }

    onChange(Math.min(max, safeValue + step));
  }, [canIncrease, max, onChange, safeValue, step]);

  const fillPercent = useMemo<number>(() => {
    if (max === min) {
      return 0;
    }

    return ((safeValue - min) / (max - min)) * 100;
  }, [max, min, safeValue]);

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <View style={styles.headerRow}>
        <View style={styles.labelWrapper}>
          <Text style={[styles.label, labelStyle]}>
            {label}

            {required ? <Text style={styles.required}> *</Text> : null}
          </Text>

          {helperText ? (
            <Text style={styles.helperText}>{helperText}</Text>
          ) : null}
        </View>

        <View style={styles.controlsRow}>
          {showButtons ? (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!canDecrease}
              onPress={decrease}
              accessibilityRole="button"
              accessibilityLabel={
                accessibilityLabel
                  ? `Decrease ${accessibilityLabel}`
                  : `Decrease ${label}`
              }
              style={[styles.button, !canDecrease && styles.buttonDisabled]}
            >
              <Feather
                name="minus"
                size={14}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
          ) : null}

          {showValue ? (
            <Text style={[styles.value, valueStyle]}>
              {safeValue}
              {unit ? ` ${unit}` : ''}
            </Text>
          ) : null}

          {showButtons ? (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!canIncrease}
              onPress={increase}
              accessibilityRole="button"
              accessibilityLabel={
                accessibilityLabel
                  ? `Increase ${accessibilityLabel}`
                  : `Increase ${label}`
              }
              style={[styles.button, !canIncrease && styles.buttonDisabled]}
            >
              <Feather name="plus" size={14} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={[styles.track, trackStyle]}>
        <View
          style={[
            styles.fill,
            {
              width: `${fillPercent}%`,
            },
            fillStyle,
          ]}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

WeightSliderComponent.displayName = 'WeightSlider';

export const WeightSlider = memo(
  WeightSliderComponent
) as typeof WeightSliderComponent;
