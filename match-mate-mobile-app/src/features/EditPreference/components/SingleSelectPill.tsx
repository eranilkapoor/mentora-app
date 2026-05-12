import React, { useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';

type OptionType = {
  label: string;
  value: string;
};

interface Props {
  label: string;
  options: readonly OptionType[];
  value?: string;
  onChange: (v: string) => void;
  i18nPrefix?: string;
}

export function SingleSelectPill({
  label,
  options,
  value,
  onChange,
  i18nPrefix,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
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
      marginTop: 4,
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

  const handlePress = useCallback(
    (opt: string) => {
      onChange(opt);
    },
    [onChange]
  );

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
              onPress={() => handlePress(opt.value)}
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
