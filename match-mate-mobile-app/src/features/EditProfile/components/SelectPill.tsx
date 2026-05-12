import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';

export interface OptionType {
  label: string;
  value: string;
}

export interface SelectPillProps {
  label: string;
  options: readonly OptionType[];
  value?: string;
  onChange: (value: string) => void;
  i18nPrefix?: string;
}

export function SelectPill({
  label,
  options,
  value,
  onChange,
  i18nPrefix,
}: SelectPillProps): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    field: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pill: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 20,
      backgroundColor: theme.colors.inputBackground,
    },
    pillSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    pillText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    pillTextSelected: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.pillRow}>
        {options.map((opt: OptionType) => {
          const selected = value === opt.value;

          const displayLabel = i18nPrefix
            ? t(`${i18nPrefix}.${opt.value}`)
            : opt.label;

          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => onChange(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={displayLabel}
            >
              <Text
                style={[styles.pillText, selected && styles.pillTextSelected]}
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
