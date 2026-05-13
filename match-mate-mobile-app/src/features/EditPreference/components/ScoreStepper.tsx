import React, { memo, useCallback, useMemo } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface ScoreStepperProps {
  /**
   * Main label
   */
  label: string;

  /**
   * Optional helper text
   */
  sublabel?: string;

  /**
   * Current value
   */
  value: number;

  /**
   * Change handler
   */
  onChange: (value: number) => void;

  /**
   * Limits
   */
  min?: number;
  max?: number;

  /**
   * Increment/decrement step
   */
  step?: number;

  /**
   * Display suffix
   * Example: %, pts, km
   */
  suffix?: string;

  /**
   * States
   */
  disabled?: boolean;
  required?: boolean;

  /**
   * Validation
   */
  error?: string;
  helperText?: string;

  /**
   * Accessibility
   */
  accessibilityLabel?: string;
  testID?: string;

  /**
   * UI variants
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Optional styles
   */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
}

function ScoreStepperComponent({
  label,
  sublabel,
  value,
  onChange,

  min = 0,
  max = 100,
  step = 5,

  suffix = '%',

  disabled = false,
  required = false,

  error,
  helperText,

  accessibilityLabel,
  testID,

  size = 'medium',

  containerStyle,
  labelStyle,
  valueStyle,
}: ScoreStepperProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
          opacity: disabled ? 0.6 : 1,
        },

        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 52,
        },

        labelContainer: {
          flex: 1,
          paddingRight: 16,
        },

        label: {
          fontSize: size === 'small' ? 12 : size === 'large' ? 15 : 13,

          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        required: {
          color: theme.colors.error,
        },

        sublabel: {
          marginTop: 4,

          fontSize: size === 'small' ? 10 : size === 'large' ? 13 : 11,

          lineHeight: size === 'small' ? 14 : size === 'large' ? 18 : 16,

          color: theme.colors.textMuted,
        },

        controls: {
          flexDirection: 'row',
          alignItems: 'center',
        },

        button: {
          width: size === 'small' ? 30 : size === 'large' ? 40 : 34,

          height: size === 'small' ? 30 : size === 'large' ? 40 : 34,

          borderRadius: size === 'small' ? 8 : size === 'large' ? 12 : 10,

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
          textAlign: 'center',

          fontSize: size === 'small' ? 14 : size === 'large' ? 20 : 16,

          fontWeight: '700',
          color: theme.colors.primary,
        },

        helperText: {
          marginTop: 6,
          fontSize: 11,
          color: theme.colors.textMuted,
        },

        errorText: {
          marginTop: 6,
          fontSize: 11,
          color: theme.colors.error,
        },
      }),
    [disabled, size, theme]
  );

  const safeValue = Math.min(Math.max(value, min), max);

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

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}

            {required ? <Text style={styles.required}> *</Text> : null}
          </Text>

          {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
        </View>

        <View style={styles.controls}>
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
              size={size === 'small' ? 12 : size === 'large' ? 18 : 14}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          <Text style={[styles.value, valueStyle]}>
            {safeValue}
            {suffix}
          </Text>

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
            <Feather
              name="plus"
              size={size === 'small' ? 12 : size === 'large' ? 18 : 14}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

ScoreStepperComponent.displayName = 'ScoreStepper';

export const ScoreStepper = memo(
  ScoreStepperComponent
) as typeof ScoreStepperComponent;
