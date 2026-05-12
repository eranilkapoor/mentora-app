import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const d = String(i + 1).padStart(2, '0');
  return { label: d, value: d };
});

const MONTH_OPTIONS = [
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

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 60 }, (_, i) => {
  const y = String(currentYear - 18 - i);
  return { label: y, value: y };
});

interface DateOfBirthPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

interface DropdownListProps {
  options: { label: string; value: string }[];
  selected: string;
  onSelect: (v: string) => void;
  primaryColor: string;
  primaryLight: string;
  textPrimary: string;
  textMuted: string;
  divider: string;
  surface: string;
}

function DropdownList({
  options,
  selected,
  onSelect,
  primaryColor,
  primaryLight,
  textPrimary,
  textMuted,
  divider,
  surface,
}: DropdownListProps): React.ReactElement {
  return (
    <ScrollView
      style={{ maxHeight: 180, backgroundColor: surface, borderRadius: 10 }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: isSelected }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 11,
              backgroundColor: isSelected ? primaryLight : surface,
              borderBottomWidth: 0.5,
              borderBottomColor: divider,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: isSelected ? primaryColor : textPrimary,
                fontWeight: isSelected ? '600' : '400',
              }}
            >
              {opt.label}
            </Text>
            {isSelected && (
              <Feather name="check" size={13} color={primaryColor} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DateOfBirthPicker({
  label,
  value,
  onChange,
  hasError = false,
}: DateOfBirthPickerProps): React.ReactElement {
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
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
  });


  const [visible, setVisible] = useState(false);
  const [tempDay, setTempDay] = useState('');
  const [tempMonth, setTempMonth] = useState('');
  const [tempYear, setTempYear] = useState('');

  // ─── Parse existing value into parts when opening ─────────────────────────

  const openPicker = useCallback(() => {
    if (value) {
      const [y = '', m = '', d = ''] = value.split('-');
      setTempYear(y);
      setTempMonth(m);
      setTempDay(d);
    } else {
      setTempDay('');
      setTempMonth('');
      setTempYear('');
    }
    setVisible(true);
  }, [value]);

  // ─── Confirm ──────────────────────────────────────────────────────────────

  const handleConfirm = useCallback(() => {
    if (!tempDay || !tempMonth || !tempYear) {
      Alert.alert(
        t('common.error'),
        t('edit_profile.errors.date_incomplete')
      );
      return;
    }

    const formatted = `${tempYear}-${tempMonth}-${tempDay}`;
    onChange(formatted);
    setVisible(false);
  }, [tempDay, tempMonth, tempYear, onChange, t]);

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, []);

  // ─── Display label ────────────────────────────────────────────────────────

  const displayValue = (() => {
    if (!value) return t('edit_profile.placeholders.select_date');
    
    return value;
  })();

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      {/* Trigger button */}
      <TouchableOpacity
        onPress={openPicker}
        style={[
          styles.input,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          hasError && {
            borderColor: theme.colors.error,
            backgroundColor: theme.colors.errorLight,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        activeOpacity={0.8}
      >
        <Text
          style={
            value
              ? { color: theme.colors.textPrimary, fontSize: 15 }
              : { color: theme.colors.textMuted, fontSize: 15 }
          }
        >
          {displayValue}
        </Text>
        <Feather
          name="calendar"
          size={16}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {/* Picker Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: theme.colors.modalOverlay,
            justifyContent: 'center',
            padding: 20,
          }}
          activeOpacity={1}
          onPress={handleCancel}
        >
          {/* Modal card — stop propagation so tapping inside doesn't close */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 20,
              shadowColor: theme.colors.black,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Title */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              {t('edit_profile.date_picker.title')}
            </Text>

            {/* Three column layout */}
            <View style={{ flexDirection: 'row', gap: 14 }}>

              {/* Day */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: theme.colors.textMuted,
                    marginBottom: 6,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('edit_profile.date_picker.day')}
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  <DropdownList
                    options={DAY_OPTIONS}
                    selected={tempDay}
                    onSelect={setTempDay}
                    primaryColor={theme.colors.primary}
                    primaryLight={theme.colors.primaryLight}
                    textPrimary={theme.colors.textPrimary}
                    textMuted={theme.colors.textMuted}
                    divider={theme.colors.divider}
                    surface={theme.colors.surface}
                  />
                </View>
              </View>

              {/* Month */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: theme.colors.textMuted,
                    marginBottom: 6,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('edit_profile.date_picker.month')}
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  <DropdownList
                    options={MONTH_OPTIONS}
                    selected={tempMonth}
                    onSelect={setTempMonth}
                    primaryColor={theme.colors.primary}
                    primaryLight={theme.colors.primaryLight}
                    textPrimary={theme.colors.textPrimary}
                    textMuted={theme.colors.textMuted}
                    divider={theme.colors.divider}
                    surface={theme.colors.surface}
                  />
                </View>
              </View>

              {/* Year */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: theme.colors.textMuted,
                    marginBottom: 6,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('edit_profile.date_picker.year')}
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  <DropdownList
                    options={YEAR_OPTIONS}
                    selected={tempYear}
                    onSelect={setTempYear}
                    primaryColor={theme.colors.primary}
                    primaryLight={theme.colors.primaryLight}
                    textPrimary={theme.colors.textPrimary}
                    textMuted={theme.colors.textMuted}
                    divider={theme.colors.divider}
                    surface={theme.colors.surface}
                  />
                </View>
              </View>
            </View>

            {/* Selected preview */}
            {(tempDay || tempMonth || tempYear) && (
              <View
                style={{
                  marginTop: 14,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  backgroundColor: theme.colors.primaryLight,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.colors.primary,
                  }}
                >
                  {[
                    tempDay,
                    MONTH_OPTIONS.find((m) => m.value === tempMonth)?.label,
                    tempYear,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </Text>
              </View>
            )}

            {/* Action buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 16,
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={handleCancel}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
                style={{ paddingVertical: 8, paddingHorizontal: 16 }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: theme.colors.textMuted,
                  }}
                >
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                accessibilityRole="button"
                accessibilityLabel={t('common.confirm')}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: theme.colors.white,
                  }}
                >
                  {t('common.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}