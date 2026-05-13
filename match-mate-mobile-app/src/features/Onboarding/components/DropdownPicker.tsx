import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface OptionType {
  label: string;
  value: string;
}

export interface DropdownPickerProps {
  label: string;
  options: readonly OptionType[];
  value?: string;
  onChange: (value: string) => void;

  field: string;

  errors: Record<string, string | undefined>;

  onClearError: (field: string) => void;

  showDropdown: string | null;

  onSetShowDropdown: (field: string | null) => void;
}

export function DropdownPicker({
  label,
  options,
  value,
  onChange,
  field,
  errors,
  onClearError,
  showDropdown,
  onSetShowDropdown,
}: DropdownPickerProps): React.ReactElement {
  const isOpen = showDropdown === field;
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 13,
      marginBottom: 12,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
    inputError: {
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.errorLight,
    },
    dropdownTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownValueText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
    },
    dropdownPlaceholder: {
      color: theme.colors.textMuted,
      fontSize: 15,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      maxHeight: 220,
      // Fixed: boxShadow is CSS web-only — use RN shadow props
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    dropdownItemActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    dropdownItemText: {
      fontSize: 15,
      color: theme.colors.textPrimary,
    },
    dropdownItemTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });


  const selectedLabel = useMemo(
    () => options.find((opt: OptionType) => opt.value === value)?.label ?? '',
    [value, options]
  );

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.input,
          styles.dropdownTrigger,
          errors[field] ? styles.inputError : null,
        ]}
        onPress={() => onSetShowDropdown(isOpen ? null : field)}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.select_label', { label })}
        accessibilityState={{ expanded: isOpen }}
        activeOpacity={0.8}
      >
        <Text
          style={value ? styles.dropdownValueText : styles.dropdownPlaceholder}
        >
          {value
            ? selectedLabel
            : t('onboarding.select_placeholder', { label })}
        </Text>

        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {options.map((item: OptionType) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.dropdownItem,
                  value === item.value && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onChange(item.value);

                  onClearError(field);

                  onSetShowDropdown(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    value === item.value && styles.dropdownItemTextActive,
                  ]}
                >
                  {item.label}
                </Text>

                {value === item.value && (
                  <Feather
                    name="check"
                    size={14}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
