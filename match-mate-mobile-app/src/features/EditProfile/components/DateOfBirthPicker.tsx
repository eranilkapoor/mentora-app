import React, { memo, useCallback, useMemo, useState } from 'react';

import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

/* ─────────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────────── */

export interface PickerOption {
  label: string;
  value: string;
}

export interface DatePickerProps {
  label?: string;

  /**
   * Format: YYYY-MM-DD
   */
  value?: string;

  onChange: (value: string) => void;

  /**
   * Validation
   */
  error?: string;
  required?: boolean;

  /**
   * Date constraints
   */
  minYear?: number;
  maxYear?: number;

  /**
   * Optional limits
   */
  minimumAge?: number;
  maximumAge?: number;

  /**
   * Behaviour
   */
  disabled?: boolean;

  /**
   * Custom placeholders
   */
  placeholder?: string;

  /**
   * UI
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Date format display
   */
  displayFormat?: 'YYYY-MM-DD' | 'DD MMM YYYY';

  /**
   * Modal title
   */
  modalTitle?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Constants
 * ──────────────────────────────────────────────────────────────────────────── */

const DAY_OPTIONS: PickerOption[] = Array.from({ length: 31 }, (_, index) => {
  const day = String(index + 1).padStart(2, '0');

  return {
    label: day,
    value: day,
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

/* ─────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

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

function isValidDate(year: string, month: string, day: string): boolean {
  const date = new Date(`${year}-${month}-${day}`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === Number(year) &&
    date.getMonth() + 1 === Number(month) &&
    date.getDate() === Number(day)
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Dropdown List
 * ──────────────────────────────────────────────────────────────────────────── */

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
        },

        title: {
          fontSize: 12,
          fontWeight: '700',
          textTransform: 'uppercase',
          color: theme.colors.textMuted,
          marginBottom: 8,
          textAlign: 'center',
        },

        list: {
          maxHeight: 180,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
        },

        item: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',

          paddingHorizontal: 14,
          paddingVertical: 12,

          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.divider,
        },

        itemSelected: {
          backgroundColor: theme.colors.primaryLight,
        },

        itemText: {
          fontSize: 14,
          color: theme.colors.textPrimary,
        },

        itemTextSelected: {
          color: theme.colors.primary,
          fontWeight: '700',
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <ScrollView
        style={styles.list}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {options.map((option) => {
          const isSelected = selected === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => onSelect(option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{
                selected: isSelected,
              }}
            >
              <Text
                style={[styles.itemText, isSelected && styles.itemTextSelected]}
              >
                {option.label}
              </Text>

              {isSelected ? (
                <Feather name="check" size={14} color={theme.colors.primary} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Component
 * ──────────────────────────────────────────────────────────────────────────── */

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
          marginBottom: 16,
        },

        labelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 6,
        },

        label: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        required: {
          color: theme.colors.error,
          fontWeight: '700',
        },

        trigger: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',

          minHeight: 48,

          borderWidth: 1,
          borderRadius: 12,

          borderColor: error ? theme.colors.error : theme.colors.border,

          backgroundColor: disabled
            ? theme.colors.backgroundLight
            : theme.colors.inputBackground,

          paddingHorizontal: 14,
        },

        triggerDisabled: {
          opacity: 0.6,
        },

        triggerText: {
          flex: 1,
          fontSize: 15,
        },

        placeholderText: {
          color: theme.colors.textMuted,
        },

        valueText: {
          color: theme.colors.textPrimary,
        },

        errorText: {
          marginTop: 6,
          fontSize: 12,
          color: theme.colors.error,
        },

        overlay: {
          flex: 1,
          justifyContent: 'center',
          backgroundColor: theme.colors.modalOverlay,
          padding: 20,
        },

        modalCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: 18,
          padding: 20,
          elevation: 8,
        },

        modalTitle: {
          fontSize: 17,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          textAlign: 'center',
          marginBottom: 18,
        },

        pickerRow: {
          flexDirection: 'row',
          gap: 12,
        },

        preview: {
          marginTop: 16,
          backgroundColor: theme.colors.primaryLight,
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          alignItems: 'center',
        },

        previewText: {
          fontSize: 14,
          fontWeight: '700',
          color: theme.colors.primary,
        },

        actions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 20,
        },

        cancelButton: {
          paddingHorizontal: 16,
          paddingVertical: 10,
        },

        confirmButton: {
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
    [theme, error, disabled]
  );

  const [visible, setVisible] = useState(false);

  const [tempDay, setTempDay] = useState('');
  const [tempMonth, setTempMonth] = useState('');
  const [tempYear, setTempYear] = useState('');

  const openPicker = useCallback(() => {
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
  }, [value]);

  const closePicker = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!tempDay || !tempMonth || !tempYear) {
      Alert.alert(t('common.error'), t('edit_profile.errors.date_incomplete'));

      return;
    }

    if (!isValidDate(tempYear, tempMonth, tempDay)) {
      Alert.alert(t('common.error'), t('edit_profile.errors.invalid_date'));

      return;
    }

    const formattedDate = `${tempYear}-${tempMonth}-${tempDay}`;

    onChange(formattedDate);

    closePicker();
  }, [closePicker, onChange, t, tempDay, tempMonth, tempYear]);

  const displayValue = useMemo(() => {
    if (!value) {
      return placeholder ?? t('edit_profile.placeholders.select_date');
    }

    return formatDate(value, displayFormat);
  }, [displayFormat, placeholder, t, value]);

  const previewText = useMemo(() => {
    return formatDate(`${tempYear}-${tempMonth}-${tempDay}`, 'DD MMM YYYY');
  }, [tempDay, tempMonth, tempYear]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>

          {required ? <Text style={styles.required}>*</Text> : null}
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={openPicker}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
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

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closePicker}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={closePicker}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.modalCard}
          >
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
                style={styles.cancelButton}
                onPress={closePicker}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                accessibilityRole="button"
              >
                <Text style={styles.confirmText}>{t('common.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

DatePicker.displayName = 'DatePicker';
