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
   * Main label
   */
  label: string;

  /**
   * Available options
   */
  options: readonly SelectOption<T>[];

  /**
   * Selected value
   */
  value?: T;

  /**
   * Selection callback
   */
  onChange: (value: T) => void;

  /**
   * i18n translation prefix
   * Example:
   * i18nPrefix="gender"
   * -> gender.male
   */
  i18nPrefix?: string;

  /**
   * Optional texts
   */
  helperText?: string;
  error?: string;

  /**
   * State
   */
  disabled?: boolean;
  required?: boolean;

  /**
   * Layout
   */
  direction?: 'row' | 'column';

  /**
   * Accessibility
   */
  accessibilityLabel?: string;
  testID?: string;

  /**
   * Optional styles
   */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  pillContainerStyle?: StyleProp<ViewStyle>;
  pillStyle?: StyleProp<ViewStyle>;
  selectedPillStyle?: StyleProp<ViewStyle>;
  pillTextStyle?: StyleProp<TextStyle>;
  selectedPillTextStyle?: StyleProp<TextStyle>;
}

function SingleSelectPillComponent<T extends string = string>({
  label,
  options,
  value,
  onChange,

  i18nPrefix,

  helperText,
  error,

  disabled = false,
  required = false,

  direction = 'row',

  accessibilityLabel,
  testID,

  containerStyle,
  labelStyle,
  pillContainerStyle,
  pillStyle,
  selectedPillStyle,
  pillTextStyle,
  selectedPillTextStyle,
}: SingleSelectPillProps<T>): React.ReactElement {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
          opacity: disabled ? 0.6 : 1,
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
          color: error ? theme.colors.error : theme.colors.textMuted,
        },

        pillContainer: {
          flexDirection: direction === 'column' ? 'column' : 'row',

          flexWrap: direction === 'row' ? 'wrap' : 'nowrap',

          gap: 8,
          marginTop: 4,
        },

        pill: {
          paddingVertical: 9,
          paddingHorizontal: 14,

          borderWidth: 1,
          borderRadius: 999,

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
          opacity: 0.4,
        },

        pillText: {
          fontSize: 13,
          fontWeight: '500',

          color: theme.colors.textSecondary,

          textTransform: 'capitalize',
        },

        selectedPillText: {
          color: theme.colors.primary,
          fontWeight: '700',
        },

        errorText: {
          marginTop: 6,
          fontSize: 11,
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

      onChange(option.value);
    },
    [disabled, onChange]
  );

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <Text style={[styles.label, labelStyle]}>
        {label}

        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel ?? label}
        style={[styles.pillContainer, pillContainerStyle]}
      >
        {options.map((option) => {
          const selected = value === option.value;

          const optionDisabled = disabled || option.disabled;

          const displayLabel = i18nPrefix
            ? t(`${i18nPrefix}.${option.value}`)
            : option.label;

          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.8}
              disabled={optionDisabled}
              onPress={() => handlePress(option)}
              accessibilityRole="radio"
              accessibilityState={{
                checked: selected,
                disabled: optionDisabled,
              }}
              accessibilityLabel={displayLabel}
              style={[
                styles.pill,

                selected && styles.selectedPill,

                optionDisabled && styles.disabledPill,

                pillStyle,

                selected && selectedPillStyle,
              ]}
            >
              <Text
                style={[
                  styles.pillText,

                  selected && styles.selectedPillText,

                  pillTextStyle,

                  selected && selectedPillTextStyle,
                ]}
              >
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

SingleSelectPillComponent.displayName = 'SingleSelectPill';

export const SingleSelectPill = memo(
  SingleSelectPillComponent
) as typeof SingleSelectPillComponent;
