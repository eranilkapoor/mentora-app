import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

import {
  Hour,
  HourOptions,
  Minute,
  MinuteOptions,
  Period,
  PeriodOptions,
} from '@/core/types';

export interface TimeOfBirth {
  hour?: Hour;
  minute?: Minute;
  period?: Period;
}

export interface TimeOfBirthPickerProps {
  value?: TimeOfBirth;
  onChange: (val: TimeOfBirth) => void;
}

type DropdownType = 'hour' | 'minute' | 'period' | null;

interface Styles {
  field: ViewStyle;
  timePickerLabel: TextStyle;
  timePickerRow: ViewStyle;
  timePickerColumn: ViewStyle;

  dropdownTrigger: ViewStyle;
  dropdownTriggerActive: ViewStyle;

  dropdownValue: TextStyle;
  dropdownPlaceholder: TextStyle;

  dropdown: ViewStyle;
  dropdownItem: ViewStyle;
  dropdownItemActive: ViewStyle;

  dropdownItemText: TextStyle;
  dropdownItemTextActive: TextStyle;

  iconRow: ViewStyle;
}

export function TimeOfBirthPicker({
  value,
  onChange,
}: TimeOfBirthPickerProps): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create<Styles>({
        field: {
          marginBottom: 16,
        },

        timePickerLabel: {
          marginBottom: 8,
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        timePickerRow: {
          flexDirection: 'row',
          gap: 8,
        },

        timePickerColumn: {
          flex: 1,
        },

        dropdownTrigger: {
          minHeight: 46,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.inputBackground,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },

        dropdownTriggerActive: {
          borderColor: theme.colors.primary,
        },

        dropdownValue: {
          fontSize: 14,
          color: theme.colors.textPrimary,
          fontWeight: '500',
        },

        dropdownPlaceholder: {
          fontSize: 14,
          color: theme.colors.textMuted,
        },

        dropdown: {
          marginTop: 6,
          maxHeight: 180,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          overflow: 'hidden',
        },

        dropdownItem: {
          minHeight: 42,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },

        dropdownItemActive: {
          backgroundColor: theme.colors.primaryLight,
        },

        dropdownItemText: {
          fontSize: 14,
          color: theme.colors.textPrimary,
        },

        dropdownItemTextActive: {
          color: theme.colors.primary,
          fontWeight: '600',
        },

        iconRow: {
          flexDirection: 'row',
          alignItems: 'center',
        },
      }),
    [theme]
  );

  const renderDropdown = (
    type: DropdownType,
    label: string,
    options: readonly { label: string; value: string }[],
    selectedValue?: string
  ): React.ReactElement => {
    const isOpen = openDropdown === type;

    const selectedLabel =
      options.find((opt) => opt.value === selectedValue)?.label ?? '';

    return (
      <View style={styles.timePickerColumn}>
        <Text style={styles.timePickerLabel}>{label}</Text>

        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            isOpen ? styles.dropdownTriggerActive : null,
          ]}
          onPress={() => setOpenDropdown(isOpen ? null : type)}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ expanded: isOpen }}
          activeOpacity={0.8}
        >
          <Text
            style={
              selectedValue ? styles.dropdownValue : styles.dropdownPlaceholder
            }
          >
            {selectedLabel || label}
          </Text>

          <Feather
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>

        {isOpen ? (
          <View style={styles.dropdown}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {options.map((item) => {
                const selected = item.value === selectedValue;

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      selected ? styles.dropdownItemActive : null,
                    ]}
                    onPress={() => {
                      if (type === 'hour') {
                        onChange({
                          ...(value ?? {}),
                          hour: item.value as Hour,
                        });
                      }

                      if (type === 'minute') {
                        onChange({
                          ...(value ?? {}),
                          minute: item.value as Minute,
                        });
                      }

                      if (type === 'period') {
                        onChange({
                          ...(value ?? {}),
                          period: item.value as Period,
                        });
                      }

                      setOpenDropdown(null);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selected ? styles.dropdownItemTextActive : null,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {selected ? (
                      <Feather
                        name="check"
                        size={14}
                        color={theme.colors.primary}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.field}>
      <Text style={styles.timePickerLabel}>
        {t('edit_profile.fields.time_of_birth')}
      </Text>

      <View style={styles.timePickerRow}>
        {renderDropdown(
          'hour',
          t('edit_profile.time.hour'),
          HourOptions,
          value?.hour
        )}

        {renderDropdown(
          'minute',
          t('edit_profile.time.minute'),
          MinuteOptions,
          value?.minute
        )}

        {renderDropdown(
          'period',
          t('edit_profile.time.period'),
          PeriodOptions,
          value?.period
        )}
      </View>
    </View>
  );
}
