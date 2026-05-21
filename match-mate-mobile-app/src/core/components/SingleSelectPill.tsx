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

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface SingleSelectPillProps<T extends string = string> {
  /**
   * Label
   */
  label?: string;

  /**
   * Options
   */
  options: readonly SelectOption<T>[];

  /**
   * Selected value
   */
  value?: T;

  /**
   * Change handler
   */
  onChange: (value: T) => void;

  /**
   * Translation support
   * Example:
   * i18nPrefix="gender"
   * => gender.male
   */
  i18nPrefix?: string;

  /**
   * UI States
   */
  disabled?: boolean;
  required?: boolean;

  /**
   * Validation
   */
  helperText?: string;
  error?: string;

  /**
   * Layout
   */
  direction?: 'row' | 'column';

  /**
   * Empty state
   */
  emptyText?: string;

  /**
   * Styling
   */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;

  pillContainerStyle?: StyleProp<ViewStyle>;

  pillStyle?: StyleProp<ViewStyle>;
  selectedPillStyle?: StyleProp<ViewStyle>;
  disabledPillStyle?: StyleProp<ViewStyle>;

  textStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;

  /**
   * Accessibility
   */
  accessibilityLabel?: string;
  testID?: string;
}

function SingleSelectPillComponent<T extends string = string>({
  label,
  options,
  value,
  onChange,

  i18nPrefix,

  disabled = false,
  required = false,

  helperText,
  error,

  direction = 'row',

  emptyText = 'No options available',

  containerStyle,
  labelStyle,

  pillContainerStyle,

  pillStyle,
  selectedPillStyle,
  disabledPillStyle,

  textStyle,
  selectedTextStyle,

  accessibilityLabel,
  testID,
}: SingleSelectPillProps<T>): React.ReactElement {
  const { theme } = useTheme();

  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
          opacity: disabled ? 0.7 : 1,
        },

        label: {
          marginBottom: 6,
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        required: {
          color: theme.colors.error,
        },

        helperText: {
          marginBottom: 8,
          fontSize: 11,
          lineHeight: 16,
          color: error
            ? theme.colors.error
            : theme.colors.textMuted,
        },

        pillContainer: {
          flexDirection:
            direction === 'column' ? 'column' : 'row',

          flexWrap:
            direction === 'row' ? 'wrap' : 'nowrap',

          gap: 8,
        },

        pill: {
          minHeight: 40,

          paddingHorizontal: 14,
          paddingVertical: 10,

          borderRadius: 999,

          borderWidth: 1,

          borderColor: theme.colors.border,

          backgroundColor: theme.colors.inputBackground,

          alignItems: 'center',
          justifyContent: 'center',
        },

        selectedPill: {
          backgroundColor: theme.colors.primaryLight,
          borderColor: theme.colors.primary,
        },

        disabledPill: {
          opacity: 0.45,
        },

        text: {
          fontSize: 13,
          fontWeight: '500',

          color: theme.colors.textSecondary,

          textTransform: 'capitalize',
        },

        selectedText: {
          color: theme.colors.primary,
          fontWeight: '700',
        },

        emptyText: {
          fontSize: 13,
          color: theme.colors.textMuted,
        },

        errorText: {
          marginTop: 6,
          fontSize: 11,
          lineHeight: 16,
          color: theme.colors.error,
        },
      }),
    [direction, disabled, error, theme]
  );

  const handlePress = useCallback(
    (option: SelectOption<T>): void => {
      if (disabled || option.disabled) {
        return;
      }

      if (option.value === value) {
        return;
      }

      onChange(option.value);
    },
    [disabled, onChange, value]
  );

  const renderLabel = useCallback(
    (option: SelectOption<T>): string => {
      if (i18nPrefix) {
        return t(`${i18nPrefix}.${option.value}`);
      }

      return option.label;
    },
    [i18nPrefix, t]
  );

  if (options.length === 0) {
    return (
      <View style={[styles.container, containerStyle]}>
        {label ? (
          <Text style={[styles.label, labelStyle]}>
            {label}

            {required ? (
              <Text style={styles.required}> *</Text>
            ) : null}
          </Text>
        ) : null}

        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, containerStyle]}
      testID={testID}
    >
      {label ? (
        <Text style={[styles.label, labelStyle]}>
          {label}

          {required ? (
            <Text style={styles.required}> *</Text>
          ) : null}
        </Text>
      ) : null}

      {helperText ? (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel ?? label}
        style={[
          styles.pillContainer,
          pillContainerStyle,
        ]}
      >
        {options.map((option) => {
          const selected = value === option.value;

          const optionDisabled =
            disabled || option.disabled;

          const displayLabel = renderLabel(option);

          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.8}
              disabled={optionDisabled}
              onPress={() => handlePress(option)}
              accessibilityRole="radio"
              accessibilityLabel={displayLabel}
              accessibilityState={{
                checked: selected,
                disabled: optionDisabled,
              }}
              style={[
                styles.pill,

                selected && styles.selectedPill,

                optionDisabled && styles.disabledPill,

                pillStyle,

                selected && selectedPillStyle,

                optionDisabled && disabledPillStyle,
              ]}
            >
              <Text
                style={[
                  styles.text,

                  selected && styles.selectedText,

                  textStyle,

                  selected && selectedTextStyle,
                ]}
              >
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

SingleSelectPillComponent.displayName =
  'SingleSelectPill';

export const SingleSelectPill = memo(
  SingleSelectPillComponent
) as typeof SingleSelectPillComponent;