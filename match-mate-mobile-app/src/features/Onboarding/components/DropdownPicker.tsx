import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { DropdownPickerProps, OptionType } from '../Onboarding.types';
import { onboardingStyles } from '../Onboarding.styles';

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

  const styles = useThemedStyles(onboardingStyles);

  const { theme } = useTheme();

  const { t } = useTranslation();

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
