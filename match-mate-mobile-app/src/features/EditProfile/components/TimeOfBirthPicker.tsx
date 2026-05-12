import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SelectPill } from './SelectPill';
import {
  Hour,
  HourOptions,
  Minute,
  MinuteOptions,
  Period,
  PeriodOptions,
} from '@/core/types';
import { useTheme } from '@/core/theme/ThemeProvider';

export interface TimeOfBirth {
  hour?: Hour;
  minute?: Minute;
  period?: Period;
}

export interface TimeOfBirthPickerProps {
  value?: TimeOfBirth;
  onChange: (val: TimeOfBirth) => void;
}

export function TimeOfBirthPicker({
  value,
  onChange,
}: TimeOfBirthPickerProps): React.ReactElement {
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
    timePickerLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    timePickerRow: {
      flexDirection: 'row',
      gap: 8,
    },
    timePickerColumn: {
      flex: 1,
    },
  });


  return (
    <View style={styles.field}>
      <Text style={styles.timePickerLabel}>
        {t('edit_profile.fields.time_of_birth')}
      </Text>
      <View style={styles.timePickerRow}>
        <View style={styles.timePickerColumn}>
          <SelectPill
            label={t('edit_profile.time.hour')}
            options={HourOptions}
            value={
              value?.hour !== null && value?.hour !== undefined
                ? String(value.hour)
                : undefined
            }
            onChange={(v) =>
              onChange({
                ...(value ?? {}),
                hour: v as Hour,
              })
            }
          />
        </View>

        <View style={styles.timePickerColumn}>
          <SelectPill
            label={t('edit_profile.time.minute')}
            options={MinuteOptions}
            value={
              value?.minute !== null && value?.minute !== undefined
                ? String(value.minute).padStart(2, '0')
                : undefined
            }
            onChange={(v) =>
              onChange({
                ...(value ?? {}),
                minute: v as Minute,
              })
            }
          />
        </View>

        <View style={styles.timePickerColumn}>
          <SelectPill
            label={t('edit_profile.time.period')}
            options={PeriodOptions}
            value={value?.period}
            onChange={(v) => onChange({ ...value, period: v as Period })}
          />
        </View>
      </View>
    </View>
  );
}
