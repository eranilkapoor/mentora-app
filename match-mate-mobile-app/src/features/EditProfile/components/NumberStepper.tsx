import React, { useCallback, useMemo } from 'react';
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

export interface NumberStepperProps {
  label: string;
  value?: number;
  onChange: (value: number) => void;

  min?: number;
  max?: number;
  step?: number;

  disabled?: boolean;

  /**
   * Optional helper text below label
   */
  helperText?: string;

  /**
   * Custom accessibility labels
   */
  increaseAccessibilityLabel?: string;
  decreaseAccessibilityLabel?: string;

  /**
   * Optional formatter for display value
   */
  formatValue?: (value: number) => string;

  /**
   * Optional custom styles
   */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;

  /**
   * Show borders around entire row
   */
  bordered?: boolean;
}

export function NumberStepper({
  label,
  value = 0,
  onChange,

  min = 0,
  max = 20,
  step = 1,

  disabled = false,

  helperText,

  increaseAccessibilityLabel,
  decreaseAccessibilityLabel,

  formatValue,

  containerStyle,
  labelStyle,
  valueStyle,

  bordered = false,
}: NumberStepperProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
        },

        borderedContainer: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 12,
          padding: 12,
          backgroundColor: theme.colors.surface,
        },

        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          minHeight: 44,
        },

        labelContainer: {
          flex: 1,
        },

        label: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        helperText: {
          marginTop: 4,
          fontSize: 12,
          lineHeight: 18,
          color: theme.colors.textMuted,
        },

        controls: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },

        button: {
          width: 36,
          height: 36,
          borderRadius: 10,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.inputBackground,
        },

        buttonDisabled: {
          opacity: 0.4,
        },

        valueContainer: {
          minWidth: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },

        value: {
          fontSize: 16,
          fontWeight: '700',
          color: theme.colors.textPrimary,
        },

        disabledContainer: {
          opacity: 0.6,
        },
      }),
    [theme]
  );

  const isMinReached = value <= min;
  const isMaxReached = value >= max;

  const decreaseDisabled = disabled || isMinReached;
  const increaseDisabled = disabled || isMaxReached;

  const displayValue = useMemo(
    () => (formatValue ? formatValue(value) : String(value)),
    [formatValue, value]
  );

  const handleDecrease = useCallback(() => {
    if (decreaseDisabled) {
      return;
    }

    const nextValue = Math.max(min, value - step);
    onChange(nextValue);
  }, [decreaseDisabled, min, onChange, step, value]);

  const handleIncrease = useCallback(() => {
    if (increaseDisabled) {
      return;
    }

    const nextValue = Math.min(max, value + step);
    onChange(nextValue);
  }, [increaseDisabled, max, onChange, step, value]);

  return (
    <View
      style={[
        styles.container,
        bordered && styles.borderedContainer,
        disabled && styles.disabledContainer,
        containerStyle,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>

          {helperText ? (
            <Text style={styles.helperText}>{helperText}</Text>
          ) : null}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleDecrease}
            disabled={decreaseDisabled}
            style={[styles.button, decreaseDisabled && styles.buttonDisabled]}
            accessibilityRole="button"
            accessibilityLabel={
              decreaseAccessibilityLabel ?? `Decrease ${label}`
            }
            accessibilityState={{
              disabled: decreaseDisabled,
            }}
            hitSlop={{
              top: 6,
              bottom: 6,
              left: 6,
              right: 6,
            }}
          >
            <Feather name="minus" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.valueContainer}>
            <Text style={[styles.value, valueStyle]}>{displayValue}</Text>
          </View>

          <TouchableOpacity
            onPress={handleIncrease}
            disabled={increaseDisabled}
            style={[styles.button, increaseDisabled && styles.buttonDisabled]}
            accessibilityRole="button"
            accessibilityLabel={
              increaseAccessibilityLabel ?? `Increase ${label}`
            }
            accessibilityState={{
              disabled: increaseDisabled,
            }}
            hitSlop={{
              top: 6,
              bottom: 6,
              left: 6,
              right: 6,
            }}
          >
            <Feather name="plus" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

NumberStepper.displayName = 'NumberStepper';
