import React, { memo, useCallback, useMemo, useState } from 'react';

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { showError } from '@/core/utils/toast';

/* ──────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────── */

export interface PickerOption {
  label: string;
  value: string;
}

export interface DatePickerProps {
  label?: string;

  /**
   * YYYY-MM-DD
   */
  value?: string;

  onChange: (value: string) => void;

  /**
   * Validation
   */
  error?: string;
  required?: boolean;

  /**
   * Limits
   */
  minYear?: number;
  maxYear?: number;

  minimumAge?: number;
  maximumAge?: number;

  /**
   * State
   */
  disabled?: boolean;

  /**
   * UI
   */
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Display
   */
  displayFormat?: 'YYYY-MM-DD' | 'DD MMM YYYY';

  /**
   * Modal
   */
  modalTitle?: string;
}

/* ──────────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────────── */

const DAY_OPTIONS: PickerOption[] = Array.from({ length: 31 }, (_, index) => {
  const value = String(index + 1).padStart(2, '0');

  return {
    label: value,
    value,
  };
});

const MONTH_OPTIONS: PickerOption[] = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

/* ──────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────── */

function generateYearOptions(
  startYear: number,
  endYear: number
): PickerOption[] {
  return Array.from({ length: startYear - endYear + 1 }, (_, index) => {
    const year = String(startYear - index);

    return {
      label: year,
      value: year,
    };
  });
}

function isValidDate(year: string, month: string, day: string): boolean {
  const date = new Date(`${year}-${month}-${day}`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === Number(year) &&
    date.getMonth() + 1 === Number(month) &&
    date.getDate() === Number(day)
  );
}

function formatDate(
  value?: string,
  format: 'YYYY-MM-DD' | 'DD MMM YYYY' = 'YYYY-MM-DD'
): string {
  if (!value) {
    return '';
  }

  const [year = '', month = '', day = ''] = value.split('-');

  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }

  const monthLabel =
    MONTH_OPTIONS.find((m) => m.value === month)?.label ?? month;

  return `${day} ${monthLabel} ${year}`;
}

/* ──────────────────────────────────────────────────────────────
 * Dropdown List
 * ────────────────────────────────────────────────────────────── */

interface DropdownListProps {
  title: string;
  options: PickerOption[];
  selected?: string;
  onSelect: (value: string) => void;
}

const DropdownList = memo(function DropdownList({
  title,
  options,
  selected,
  onSelect,
}: DropdownListProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          minWidth: 0,
        },

        title: {
          marginBottom: 8,

          fontSize: 12,
          fontWeight: '700',
          textTransform: 'uppercase',

          textAlign: 'center',

          color: theme.colors.textMuted,
        },

        listWrapper: {
          borderWidth: 1,
          borderRadius: 12,
          borderColor: theme.colors.border,

          backgroundColor: theme.colors.surface,

          overflow: 'hidden',

          maxHeight: 220,
        },

        list: {
          flexGrow: 0,
        },

        item: {
          minHeight: 46,

          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',

          paddingHorizontal: 12,
          paddingVertical: 10,

          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.divider,
        },

        itemSelected: {
          backgroundColor: theme.colors.primaryLight,
        },

        itemText: {
          flex: 1,

          fontSize: 14,
          color: theme.colors.textPrimary,
        },

        itemTextSelected: {
          fontWeight: '700',
          color: theme.colors.primary,
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container}>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <View style={styles.listWrapper}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
        >
          {options.map((option) => {
            const isSelected = selected === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{
                  selected: isSelected,
                }}
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => onSelect(option.value)}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}
                >
                  {option.label}
                </Text>

                {isSelected ? (
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
    </View>
  );
});

/* ──────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────── */

export const DatePicker = memo(function DatePicker({
  label,
  value,
  onChange,

  error,
  required = false,

  minYear,
  maxYear,

  minimumAge = 18,
  maximumAge = 80,

  disabled = false,

  placeholder,
  containerStyle,

  displayFormat = 'YYYY-MM-DD',

  modalTitle,
}: DatePickerProps): React.ReactElement {
  const { theme } = useTheme();

  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  const computedMaxYear = maxYear ?? currentYear - minimumAge;

  const computedMinYear = minYear ?? currentYear - maximumAge;

  const yearOptions = useMemo(
    () => generateYearOptions(computedMaxYear, computedMinYear),
    [computedMaxYear, computedMinYear]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: '100%',
          marginBottom: 16,
        },

        labelRow: {
          flexDirection: 'row',
          alignItems: 'center',

          marginBottom: 6,
        },

        label: {
          fontSize: 13,
          fontWeight: '600',

          color: theme.colors.textSecondary,
        },

        required: {
          marginLeft: 4,

          fontWeight: '700',

          color: theme.colors.error,
        },

        trigger: {
          minHeight: 50,

          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',

          borderWidth: 1,
          borderRadius: 12,

          paddingHorizontal: 14,

          borderColor: error ? theme.colors.error : theme.colors.border,

          backgroundColor: disabled
            ? theme.colors.backgroundLight
            : theme.colors.inputBackground,
        },

        triggerDisabled: {
          opacity: 0.6,
        },

        triggerText: {
          flex: 1,

          fontSize: 15,
        },

        valueText: {
          color: theme.colors.textPrimary,
        },

        placeholderText: {
          color: theme.colors.textMuted,
        },

        errorText: {
          marginTop: 6,

          fontSize: 12,

          color: theme.colors.error,
        },

        overlay: {
          flex: 1,

          justifyContent: 'center',

          padding: 16,

          backgroundColor: theme.colors.modalOverlay,
        },

        modalCard: {
          width: '100%',
          maxWidth: 720,

          alignSelf: 'center',

          borderRadius: 20,

          backgroundColor: theme.colors.surface,

          padding: 18,

          overflow: 'hidden',

          shadowColor: theme.colors.black,
          shadowOffset: {
            width: 0,
            height: 6,
          },
          shadowOpacity: 0.14,
          shadowRadius: 12,

          elevation: 10,
        },

        modalTitle: {
          marginBottom: 18,

          textAlign: 'center',

          fontSize: 17,
          fontWeight: '700',

          color: theme.colors.textPrimary,
        },

        pickerRow: {
          width: '100%',

          flexDirection: 'row',
          alignItems: 'flex-start',

          gap: 10,
        },

        preview: {
          marginTop: 18,

          alignItems: 'center',

          paddingHorizontal: 12,
          paddingVertical: 10,

          borderRadius: 12,

          backgroundColor: theme.colors.primaryLight,
        },

        previewText: {
          fontSize: 14,
          fontWeight: '700',

          color: theme.colors.primary,
        },

        actions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',

          marginTop: 22,
        },

        cancelButton: {
          paddingHorizontal: 16,
          paddingVertical: 10,
        },

        confirmButton: {
          marginLeft: 10,

          paddingHorizontal: 18,
          paddingVertical: 10,

          borderRadius: 10,

          backgroundColor: theme.colors.primary,
        },

        cancelText: {
          fontSize: 15,
          fontWeight: '600',

          color: theme.colors.textMuted,
        },

        confirmText: {
          fontSize: 15,
          fontWeight: '700',

          color: theme.colors.white,
        },
      }),
    [theme, disabled, error]
  );

  const [visible, setVisible] = useState(false);

  const [tempDay, setTempDay] = useState('');
  const [tempMonth, setTempMonth] = useState('');
  const [tempYear, setTempYear] = useState('');

  /* ────────────────────────────────────────────────────────── */

  const openPicker = useCallback(() => {
    if (disabled) {
      return;
    }

    if (value) {
      const [year = '', month = '', day = ''] = value.split('-');

      setTempYear(year);
      setTempMonth(month);
      setTempDay(day);
    } else {
      setTempDay('');
      setTempMonth('');
      setTempYear('');
    }

    setVisible(true);
  }, [disabled, value]);

  const closePicker = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!tempDay || !tempMonth || !tempYear) {
      showError({
        title: t('common.error'),
        message: t('edit_profile.errors.date_incomplete'),
      });

      return;
    }

    if (!isValidDate(tempYear, tempMonth, tempDay)) {
      showError({
        title: t('common.error'),
        message: t('edit_profile.errors.invalid_date'),
      });

      return;
    }

    const formattedDate = `${tempYear}-${tempMonth}-${tempDay}`;

    onChange(formattedDate);

    closePicker();
  }, [closePicker, onChange, t, tempDay, tempMonth, tempYear]);

  /* ────────────────────────────────────────────────────────── */

  const displayValue = useMemo(() => {
    if (!value) {
      return placeholder ?? t('edit_profile.placeholders.select_date');
    }

    return formatDate(value, displayFormat);
  }, [displayFormat, placeholder, t, value]);

  const previewText = useMemo(() => {
    if (!tempDay || !tempMonth || !tempYear) {
      return '';
    }

    return formatDate(`${tempYear}-${tempMonth}-${tempDay}`, 'DD MMM YYYY');
  }, [tempDay, tempMonth, tempYear]);

  /* ────────────────────────────────────────────────────────── */

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>

          {required ? <Text style={styles.required}>*</Text> : null}
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={openPicker}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            value ? styles.valueText : styles.placeholderText,
          ]}
        >
          {displayValue}
        </Text>

        <Feather name="calendar" size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Modal */}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closePicker}
      >
        <Pressable style={styles.overlay} onPress={closePicker}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {modalTitle ?? t('edit_profile.date_picker.title')}
            </Text>

            <View style={styles.pickerRow}>
              <DropdownList
                title={t('edit_profile.date_picker.day')}
                options={DAY_OPTIONS}
                selected={tempDay}
                onSelect={setTempDay}
              />

              <DropdownList
                title={t('edit_profile.date_picker.month')}
                options={MONTH_OPTIONS}
                selected={tempMonth}
                onSelect={setTempMonth}
              />

              <DropdownList
                title={t('edit_profile.date_picker.year')}
                options={yearOptions}
                selected={tempYear}
                onSelect={setTempYear}
              />
            </View>

            {previewText ? (
              <View style={styles.preview}>
                <Text style={styles.previewText}>{previewText}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.cancelButton}
                onPress={closePicker}
              >
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>{t('common.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});

DatePicker.displayName = 'DatePicker';
