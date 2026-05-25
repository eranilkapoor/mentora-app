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
  /**
   * Main label
   */
  label?: string;

  /**
   * Available options
   */
  options: readonly OptionType<T>[];

  /**
   * Selected values
   */
  value?: T[];

  /**
   * Selection callback
   */
  onChange: (value: T[]) => void;

  /**
   * Translation prefix
   * Example:
   * i18nPrefix="profile.languages"
   */
  i18nPrefix?: string;

  /**
   * Helper / Validation
   */
  helperText?: string;
  error?: string;

  /**
   * States
   */
  disabled?: boolean;
  required?: boolean;

  /**
   * Selection rules
   */
  maxSelection?: number;
  minSelection?: number;

  /**
   * Trigger when max reached
   */
  onMaxSelectionReached?: () => void;

  /**
   * UI
   */
  showSelectedCount?: boolean;

  /**
   * Layout
   */
  direction?: 'row' | 'column';

  /**
   * Empty state
   */
  emptyText?: string;

  /**
   * Accessibility
   */
  accessibilityLabel?: string;

  /**
   * Testing
   */
  testID?: string;

  /**
   * Style overrides
   */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;

  helperTextStyle?: StyleProp<TextStyle>;
  errorTextStyle?: StyleProp<TextStyle>;

  pillContainerStyle?: StyleProp<ViewStyle>;

  pillStyle?: StyleProp<ViewStyle>;
  selectedPillStyle?: StyleProp<ViewStyle>;
  disabledPillStyle?: StyleProp<ViewStyle>;

  pillTextStyle?: StyleProp<TextStyle>;
  selectedPillTextStyle?: StyleProp<TextStyle>;
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
  required = false,

  maxSelection,
  minSelection = 0,

  onMaxSelectionReached,

  showSelectedCount = false,

  direction = 'row',

  emptyText = 'No options available',

  accessibilityLabel,

  testID,

  containerStyle,
  labelStyle,

  helperTextStyle,
  errorTextStyle,

  pillContainerStyle,

  pillStyle,
  selectedPillStyle,
  disabledPillStyle,

  pillTextStyle,
  selectedPillTextStyle,
}: MultiSelectPillProps<T>): React.ReactElement {
  const { theme } = useTheme();

  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,

          opacity: disabled ? 0.7 : 1,
        },

        headerRow: {
          flexDirection: 'row',

          alignItems: 'center',

          justifyContent: 'space-between',

          marginBottom: 6,

          gap: 10,
        },

        label: {
          flexShrink: 1,

          fontSize: 13,

          fontWeight: '600',

          color: theme.colors.textSecondary,
        },

        required: {
          color: theme.colors.error,
        },

        selectedCount: {
          fontSize: 12,

          fontWeight: '700',

          color: theme.colors.primary,
        },

        helperText: {
          marginBottom: 8,

          fontSize: 11,

          lineHeight: 16,

          color: error ? theme.colors.error : theme.colors.textMuted,
        },

        errorText: {
          marginTop: 6,

          fontSize: 11,

          lineHeight: 16,

          color: theme.colors.error,
        },

        pillContainer: {
          flexDirection: direction === 'column' ? 'column' : 'row',

          flexWrap: direction === 'row' ? 'wrap' : 'nowrap',

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

        pillPressed: {
          opacity: 0.7,
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

        emptyText: {
          fontSize: 13,

          color: theme.colors.textMuted,
        },
      }),
    [direction, disabled, error, theme]
  );

  /**
   * Fast lookup
   */
  const selectedSet = useMemo(() => new Set(value), [value]);

  /**
   * Toggle option
   */
  const toggleOption = useCallback(
    (selectedValue: T): void => {
      if (disabled) {
        return;
      }

      const alreadySelected = selectedSet.has(selectedValue);

      /**
       * Remove
       */
      if (alreadySelected) {
        if (value.length <= minSelection) {
          return;
        }

        onChange(value.filter((v) => v !== selectedValue));

        return;
      }

      /**
       * Max limit
       */
      if (maxSelection && value.length >= maxSelection) {
        onMaxSelectionReached?.();

        return;
      }

      /**
       * Add safely
       */
      onChange(Array.from(new Set([...value, selectedValue])));
    },
    [
      disabled,
      selectedSet,
      value,
      minSelection,
      maxSelection,
      onChange,
      onMaxSelectionReached,
    ]
  );

  /**
   * Empty state
   */
  if (options.length === 0) {
    return (
      <View style={[styles.container, containerStyle]}>
        {label ? (
          <Text style={[styles.label, labelStyle]}>
            {label}

            {required ? <Text style={styles.required}> *</Text> : null}
          </Text>
        ) : null}

        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {(Boolean(label) || showSelectedCount) && (
        <View style={styles.headerRow}>
          {label ? (
            <Text style={[styles.label, labelStyle]}>
              {label}

              {required ? <Text style={styles.required}> *</Text> : null}
            </Text>
          ) : null}

          {showSelectedCount ? (
            <Text style={styles.selectedCount}>
              {value.length}
              {maxSelection ? `/${maxSelection}` : ''}
            </Text>
          ) : null}
        </View>
      )}

      {helperText ? (
        <Text style={[styles.helperText, helperTextStyle]}>{helperText}</Text>
      ) : null}

      <View
        accessible
        accessibilityLabel={accessibilityLabel ?? label}
        style={[styles.pillContainer, pillContainerStyle]}
      >
        {options.map((option) => {
          const selected = selectedSet.has(option.value);

          const selectionLimitReached =
            !selected && !!maxSelection && value.length >= maxSelection;

          const optionDisabled =
            disabled === true ||
            option.disabled === true ||
            selectionLimitReached;

          const displayLabel = i18nPrefix
            ? t(`${i18nPrefix}.${option.value}`)
            : option.label;

          return (
            <Pressable
              key={option.value}
              testID={testID ? `${testID}-${option.value}` : undefined}
              disabled={optionDisabled}
              onPress={() => toggleOption(option.value)}
              accessibilityRole="checkbox"
              accessibilityLabel={`${label ?? 'Option'}: ${displayLabel}`}
              accessibilityState={{
                checked: selected,
                disabled: optionDisabled,
              }}
              style={({ pressed }) => [
                styles.pill,

                selected && styles.selectedPill,

                optionDisabled && styles.disabledPill,

                pressed && !optionDisabled && styles.pillPressed,

                pillStyle,

                selected && selectedPillStyle,

                optionDisabled && disabledPillStyle,
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
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text
          accessibilityRole="alert"
          style={[styles.errorText, errorTextStyle]}
        >
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
