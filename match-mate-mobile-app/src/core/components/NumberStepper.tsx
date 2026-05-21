import React, { memo, useCallback, useMemo } from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface NumberStepperProps {
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
  prefix?: string;
  /**
   * Custom formatter
   */
  formatValue?: (value: number) => string;

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
  bordered?: boolean;

  /**
   * Optional styles
   */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  sublabelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
}

function NumberStepperComponent({
  label,
  sublabel,
  value,
  onChange,

  min = 0,
  max = 100,
  step = 5,

  suffix = '%',
  prefix,

  formatValue,

  disabled = false,
  required = false,

  error,
  helperText,

  accessibilityLabel,
  testID,

  size = 'medium',
  bordered = false,

  containerStyle,
  labelStyle,
  sublabelStyle,
  valueStyle,
}: NumberStepperProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
          opacity: disabled ? 0.6 : 1,
        },

        borderedContainer: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 14,
          backgroundColor: theme.colors.surface,
          padding: 14,
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

        valueContainer: {
          minWidth: 70,
          alignItems: 'center',
          justifyContent: 'center',
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

          fontSize: size === 'small' ? 10 : size === 'large' ? 13 : 11,

          lineHeight: size === 'small' ? 14 : size === 'large' ? 18 : 16,

          color: error ? theme.colors.error : theme.colors.textMuted,
        },
      }),
    [disabled, bordered, error, size, theme]
  );

  const safeValue = Math.min(Math.max(value, min), max);

  const decreaseDisabled = disabled || safeValue <= min;

  const increaseDisabled = disabled || safeValue >= max;

  const displayValue = useMemo(() => {
    if (formatValue) {
      return formatValue(safeValue);
    }

    return `${prefix ?? ''}${safeValue}${suffix ?? ''}`;
  }, [formatValue, prefix, safeValue, suffix]);

  const handleDecrease = useCallback((): void => {
    if (decreaseDisabled) {
      return;
    }

    onChange(Math.max(min, safeValue - step));
  }, [decreaseDisabled, min, onChange, safeValue, step]);

  const handleIncrease = useCallback((): void => {
    if (increaseDisabled) {
      return;
    }

    onChange(Math.min(max, safeValue + step));
  }, [increaseDisabled, max, onChange, safeValue, step]);

  return (
    <View
      style={[
        styles.container,
        bordered && styles.borderedContainer,
        containerStyle,
      ]}
      testID={testID}
    >
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}

            {required ? <Text style={styles.required}> *</Text> : null}
          </Text>
          {sublabel ? (
            <Text style={[styles.sublabel, sublabelStyle]}>{sublabel}</Text>
          ) : null}

          {(helperText || error) && (
            <Text style={styles.helperText}>{error ?? helperText}</Text>
          )}
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={handleDecrease}
            disabled={decreaseDisabled}
            accessibilityRole="button"
            accessibilityLabel={
              accessibilityLabel
                ? `Decrease ${accessibilityLabel}`
                : `Decrease ${label}`
            }
            accessibilityState={{
              disabled: decreaseDisabled,
            }}
            hitSlop={6}
            android_ripple={{
              color: theme.colors.primaryLight,
            }}
            style={({ pressed }) => [
              styles.button,

              decreaseDisabled && styles.buttonDisabled,

              pressed && !decreaseDisabled
                ? {
                    opacity: 0.8,
                    transform: [{ scale: 0.97 }],
                  }
                : null,
            ]}
          >
            <Feather
              name="minus"
              size={size === 'small' ? 12 : size === 'large' ? 18 : 15}
              color={theme.colors.textPrimary}
            />
          </Pressable>

          <View style={styles.valueContainer}>
            <Text style={[styles.value, valueStyle]}>{displayValue}</Text>
          </View>

          <Pressable
            onPress={handleIncrease}
            disabled={increaseDisabled}
            accessibilityRole="button"
            accessibilityLabel={
              accessibilityLabel
                ? `Increase ${accessibilityLabel}`
                : `Increase ${label}`
            }
            accessibilityState={{
              disabled: increaseDisabled,
            }}
            hitSlop={6}
            android_ripple={{
              color: theme.colors.primaryLight,
            }}
            style={({ pressed }) => [
              styles.button,

              increaseDisabled && styles.buttonDisabled,

              pressed && !increaseDisabled
                ? {
                    opacity: 0.8,
                    transform: [{ scale: 0.97 }],
                  }
                : null,
            ]}
          >
            <Feather
              name="plus"
              size={size === 'small' ? 12 : size === 'large' ? 18 : 15}
              color={theme.colors.textPrimary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

NumberStepperComponent.displayName = 'NumberStepper';

export const NumberStepper = memo(
  NumberStepperComponent
) as typeof NumberStepperComponent;
