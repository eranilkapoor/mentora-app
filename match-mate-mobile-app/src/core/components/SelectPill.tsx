import React, { memo, useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface SelectPillProps<T extends string = string> {
  label?: string;
  options: readonly SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;

  // Translation support
  i18nPrefix?: string;

  // UX
  disabled?: boolean;
  required?: boolean;

  // Styling
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  pillStyle?: StyleProp<ViewStyle>;
  selectedPillStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;

  // Accessibility
  accessibilityLabel?: string;

  // Empty state
  emptyText?: string;
}

function SelectPillComponent<T extends string = string>({
  label,
  options,
  value,
  onChange,
  i18nPrefix,
  disabled = false,
  required = false,
  containerStyle,
  labelStyle,
  pillStyle,
  selectedPillStyle,
  textStyle,
  selectedTextStyle,
  accessibilityLabel,
  emptyText = 'No options available',
}: SelectPillProps<T>): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
        },

        label: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
          marginBottom: 8,
        },

        required: {
          color: theme.colors.error,
        },

        row: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        },

        pill: {
          minHeight: 38,
          paddingHorizontal: 14,
          paddingVertical: 8,
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
          opacity: 0.5,
        },

        text: {
          fontSize: 13,
          fontWeight: '500',
          color: theme.colors.textSecondary,
          textTransform: 'capitalize',
        },

        textSelected: {
          color: theme.colors.primary,
          fontWeight: '700',
        },

        emptyText: {
          fontSize: 13,
          color: theme.colors.textMuted,
        },
      }),
    [theme]
  );

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
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <View
        style={styles.row}
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {options.map((option) => {
          const selected = value === option.value;
          const isDisabled = disabled || option.disabled;

          const displayLabel = i18nPrefix
            ? t(`${i18nPrefix}.${option.value}`)
            : option.label;

          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.8}
              disabled={isDisabled}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{
                checked: selected,
                disabled: isDisabled,
              }}
              accessibilityLabel={displayLabel}
              style={[
                styles.pill,
                selected && styles.pillSelected,
                isDisabled && styles.pillDisabled,
                pillStyle,
                selected && selectedPillStyle,
              ]}
            >
              <Text
                style={[
                  styles.text,
                  selected && styles.textSelected,
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
    </View>
  );
}

export const SelectPill = memo(
  SelectPillComponent
) as typeof SelectPillComponent;
