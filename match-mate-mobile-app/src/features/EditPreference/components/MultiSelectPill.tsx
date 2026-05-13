import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface OptionType<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MultiSelectPillProps<T extends string = string> {
  label?: string;
  options: readonly OptionType<T>[];

  value?: T[];
  onChange: (value: T[]) => void;

  /**
   * Translation prefix
   * Example:
   * i18nPrefix="profile.languages"
   */
  i18nPrefix?: string;

  /**
   * Optional helper text
   */
  helperText?: string;

  /**
   * Error text
   */
  error?: string;

  /**
   * Disable entire component
   */
  disabled?: boolean;

  /**
   * Selection behavior
   */
  maxSelection?: number;
  minSelection?: number;

  /**
   * UI customizations
   */
  required?: boolean;
  showSelectedCount?: boolean;

  /**
   * Accessibility
   */
  accessibilityLabel?: string;

  /**
   * Style overrides
   */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  pillContainerStyle?: StyleProp<ViewStyle>;
}

function MultiSelectPillComponent<T extends string = string>({
  label,
  options,
  value = [],
  onChange,
  i18nPrefix,
  helperText,
  error,
  disabled = false,
  maxSelection,
  minSelection = 0,
  required = false,
  showSelectedCount = false,
  accessibilityLabel,
  containerStyle,
  labelStyle,
  pillContainerStyle,
}: MultiSelectPillProps<T>): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
        },

        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 10,
        },

        label: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.textSecondary,
          flexShrink: 1,
        },

        required: {
          color: theme.colors.error,
        },

        selectedCount: {
          fontSize: 12,
          fontWeight: '600',
          color: theme.colors.primary,
        },

        helperText: {
          fontSize: 12,
          color: theme.colors.textMuted,
          marginBottom: 10,
          lineHeight: 18,
        },

        errorText: {
          fontSize: 12,
          color: theme.colors.error,
          marginTop: 6,
        },

        pillRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        },

        pill: {
          minHeight: 38,
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.inputBackground,
          alignItems: 'center',
          justifyContent: 'center',
        },

        pillSelected: {
          backgroundColor: theme.colors.primaryLight,
          borderColor: theme.colors.primary,
        },

        pillDisabled: {
          opacity: 0.45,
        },

        pillText: {
          fontSize: 13,
          fontWeight: '500',
          color: theme.colors.textSecondary,
          textTransform: 'capitalize',
        },

        pillTextSelected: {
          color: theme.colors.primary,
          fontWeight: '700',
        },
      }),
    [theme]
  );

  const selectedValues = useMemo(() => new Set(value), [value]);

  const isSelectionLimitReached = useCallback(
    (selected: boolean) => {
      if (selected) {
        return false;
      }

      if (!maxSelection) {
        return false;
      }

      return value.length >= maxSelection;
    },
    [maxSelection, value.length]
  );

  const toggleOption = useCallback(
    (selectedValue: T): void => {
      if (disabled) {
        return;
      }

      const isSelected = selectedValues.has(selectedValue);

      if (isSelected) {
        if (value.length <= minSelection) {
          return;
        }

        onChange(value.filter((v) => v !== selectedValue));
        return;
      }

      if (maxSelection && value.length >= maxSelection) {
        return;
      }

      onChange([...value, selectedValue]);
    },
    [disabled, selectedValues, value, minSelection, maxSelection, onChange]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {(label || showSelectedCount) && (
        <View style={styles.headerRow}>
          {!!label && (
            <Text style={[styles.label, labelStyle]}>
              {label}

              {required ? <Text style={styles.required}> *</Text> : null}
            </Text>
          )}

          {showSelectedCount ? (
            <Text style={styles.selectedCount}>
              {value.length}
              {maxSelection ? `/${maxSelection}` : ''}
            </Text>
          ) : null}
        </View>
      )}

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

      <View style={[styles.pillRow, pillContainerStyle]}>
        {options.map((option) => {
          const selected = selectedValues.has(option.value);

          const optionDisabled =
            disabled || option.disabled || isSelectionLimitReached(selected);

          const displayLabel = i18nPrefix
            ? t(`${i18nPrefix}.${option.value}`)
            : option.label;

          return (
            <Pressable
              key={option.value}
              onPress={() => toggleOption(option.value)}
              disabled={optionDisabled}
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: selected,
                disabled: optionDisabled,
              }}
              accessibilityLabel={accessibilityLabel ?? displayLabel}
              style={({ pressed }) => [
                styles.pill,
                selected && styles.pillSelected,
                optionDisabled && styles.pillDisabled,
                pressed && !optionDisabled
                  ? {
                      opacity: 0.8,
                      transform: [{ scale: 0.98 }],
                    }
                  : null,
              ]}
            >
              <Text
                style={[styles.pillText, selected && styles.pillTextSelected]}
              >
                {displayLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

MultiSelectPillComponent.displayName = 'MultiSelectPill';

export const MultiSelectPill = memo(
  MultiSelectPillComponent
) as typeof MultiSelectPillComponent;
