import React, { memo, useCallback, useMemo, useState } from 'react';

import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { applyAccessibilityToStyles } from '@/core/theme/accessibilityStyles';

import {
  Hour,
  HourOptions,
  Minute,
  MinuteOptions,
  Period,
  PeriodOptions,
} from '@/core/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface TimeOfBirth {
  hour?: Hour;
  minute?: Minute;
  period?: Period;
}

export interface TimeOfBirthPickerProps {
  value?: TimeOfBirth;
  onChange: (value: TimeOfBirth) => void;

  disabled?: boolean;
  error?: string;

  containerStyle?: ViewStyle;
}

type DropdownType = 'hour' | 'minute' | 'period' | null;

interface DropdownOption<T extends string = string> {
  label: string;
  value: T;
}

interface Styles {
  container: ViewStyle;

  label: TextStyle;

  row: ViewStyle;

  column: ViewStyle;

  trigger: ViewStyle;
  triggerActive: ViewStyle;
  triggerDisabled: ViewStyle;
  triggerError: ViewStyle;

  triggerText: TextStyle;
  placeholderText: TextStyle;

  modalOverlay: ViewStyle;

  dropdownContainer: ViewStyle;

  dropdownHeader: ViewStyle;

  dropdownTitle: TextStyle;

  closeButton: ViewStyle;

  dropdownList: ViewStyle;

  dropdownItem: ViewStyle;
  dropdownItemSelected: ViewStyle;

  dropdownItemText: TextStyle;
  dropdownItemTextSelected: TextStyle;

  divider: ViewStyle;

  errorText: TextStyle;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

function TimeOfBirthPickerComponent({
  value,
  onChange,
  disabled = false,
  error,
  containerStyle,
}: TimeOfBirthPickerProps): React.ReactElement {
  const { theme, fontScale, accessibility, reduceAnimations } = useTheme();

  const { t } = useTranslation();

  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  // ───────────────────────────────────────────────────────────
  // Styles
  // ───────────────────────────────────────────────────────────

  const styles = useMemo(
    () =>
      applyAccessibilityToStyles(
        StyleSheet.create<Styles>({
          container: {
            marginBottom: 18,

            // IMPORTANT
            overflow: 'visible',

            ...(Platform.OS === 'web'
              ? {
                  zIndex: 9999,
                }
              : {}),
          },

          label: {
            marginBottom: 8,
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.textSecondary,
          },

          row: {
            flexDirection: 'row',
            gap: 10,

            // IMPORTANT
            overflow: 'visible',

            ...(Platform.OS === 'web'
              ? {
                  zIndex: 9999,
                }
              : {}),
          },

          column: {
            flex: 1,

            // IMPORTANT
            position: 'relative',
            overflow: 'visible',

            ...(Platform.OS === 'web'
              ? {
                  zIndex: 9999,
                }
              : {}),
          },

          trigger: {
            minHeight: 48,

            paddingHorizontal: 14,

            borderWidth: 1,
            borderRadius: 12,

            borderColor: theme.colors.inputBorder,

            backgroundColor: theme.colors.inputBackground,

            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },

          triggerActive: {
            borderColor: theme.colors.inputBorder,
          },

          triggerDisabled: {
            opacity: 0.5,
          },

          triggerError: {
            borderColor: theme.colors.error,
          },

          triggerText: {
            flex: 1,

            fontSize: 14,
            fontWeight: '500',

            color: theme.colors.textPrimary,
          },

          placeholderText: {
            color: theme.colors.textMuted,
          },

          modalOverlay: {
            flex: 1,
            backgroundColor: theme.colors.modalOverlay,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          },

          dropdownContainer: {
            width: '100%',
            maxWidth: 340,

            maxHeight: 360,

            borderRadius: 16,

            overflow: 'hidden',

            backgroundColor: theme.colors.surface,

            shadowColor: theme.colors.black,
            shadowOffset: {
              width: 0,
              height: 6,
            },
            shadowOpacity: 0.12,
            shadowRadius: 10,

            elevation: 10,
          },

          dropdownHeader: {
            minHeight: 54,

            paddingHorizontal: 16,

            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,

            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },

          dropdownTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.textPrimary,
          },

          closeButton: {
            width: 34,
            height: 34,

            borderRadius: 17,

            alignItems: 'center',
            justifyContent: 'center',
          },

          dropdownList: {
            maxHeight: 300,
          },

          dropdownItem: {
            minHeight: 48,

            paddingHorizontal: 16,
            paddingVertical: 12,

            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },

          dropdownItemSelected: {
            backgroundColor: theme.colors.primaryLight,
          },

          dropdownItemText: {
            flex: 1,

            fontSize: 15,
            color: theme.colors.textPrimary,
          },

          dropdownItemTextSelected: {
            color: theme.colors.primary,
            fontWeight: '600',
          },

          divider: {
            height: 1,
            backgroundColor: theme.colors.divider,
          },

          errorText: {
            marginTop: 6,
            fontSize: 12,
            color: theme.colors.error,
          },
        }),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, fontScale, theme]
  );

  // ───────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const updateValue = useCallback(
    (type: DropdownType, selectedValue: string): void => {
      if (type === 'hour') {
        onChange({
          ...(value ?? {}),
          hour: selectedValue as Hour,
        });
      }

      if (type === 'minute') {
        onChange({
          ...(value ?? {}),
          minute: selectedValue as Minute,
        });
      }

      if (type === 'period') {
        onChange({
          ...(value ?? {}),
          period: selectedValue as Period,
        });
      }

      handleClose();
    },
    [handleClose, onChange, value]
  );

  // ───────────────────────────────────────────────────────────
  // Render Trigger
  // ───────────────────────────────────────────────────────────

  const renderTrigger = (
    type: DropdownType,
    label: string,
    selectedValue?: string
  ): React.ReactElement => {
    const isOpen = openDropdown === type;

    return (
      <View style={styles.column}>
        <Text style={styles.label}>{label}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{
            expanded: isOpen,
            disabled,
          }}
          style={[
            styles.trigger,
            isOpen && styles.triggerActive,
            disabled && styles.triggerDisabled,
            error && styles.triggerError,
          ]}
          onPress={() => setOpenDropdown(type)}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.triggerText,
              !selectedValue && styles.placeholderText,
            ]}
          >
            {selectedValue ?? label}
          </Text>

          <Feather
            name="chevron-down"
            size={16}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // ───────────────────────────────────────────────────────────
  // Current Dropdown Data
  // ───────────────────────────────────────────────────────────

  const currentDropdown = useMemo(() => {
    if (openDropdown === 'hour') {
      return {
        title: t('edit_profile.time.hour'),
        options: HourOptions,
        selected: value?.hour,
      };
    }

    if (openDropdown === 'minute') {
      return {
        title: t('edit_profile.time.minute'),
        options: MinuteOptions,
        selected: value?.minute,
      };
    }

    if (openDropdown === 'period') {
      return {
        title: t('edit_profile.time.period'),
        options: PeriodOptions,
        selected: value?.period,
      };
    }

    return null;
  }, [openDropdown, t, value]);

  // ───────────────────────────────────────────────────────────
  // Render Item
  // ───────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: DropdownOption }): React.ReactElement => {
      const isSelected = item.value === currentDropdown?.selected;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityState={{
            selected: isSelected,
          }}
          style={[
            styles.dropdownItem,
            isSelected && styles.dropdownItemSelected,
          ]}
          onPress={() => updateValue(openDropdown, item.value)}
        >
          <Text
            style={[
              styles.dropdownItemText,
              isSelected && styles.dropdownItemTextSelected,
            ]}
          >
            {item.label}
          </Text>

          {isSelected && (
            <Feather name="check" size={16} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      );
    },
    [
      currentDropdown?.selected,
      openDropdown,
      styles,
      theme.colors.primary,
      updateValue,
    ]
  );

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{t('edit_profile.fields.time_of_birth')}</Text>

      <View style={styles.row}>
        {renderTrigger('hour', t('edit_profile.time.hour'), value?.hour)}

        {renderTrigger('minute', t('edit_profile.time.minute'), value?.minute)}

        {renderTrigger('period', t('edit_profile.time.period'), value?.period)}
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* GLOBAL MODAL DROPDOWN */}

      <Modal
        visible={!!openDropdown}
        transparent
        animationType={reduceAnimations ? 'none' : 'fade'}
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Pressable style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>{currentDropdown?.title}</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Feather name="x" size={18} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={currentDropdown?.options ?? []}
              keyExtractor={(item) => item.value}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.dropdownList}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

TimeOfBirthPickerComponent.displayName = 'TimeOfBirthPicker';

export const TimeOfBirthPicker = memo(TimeOfBirthPickerComponent);
