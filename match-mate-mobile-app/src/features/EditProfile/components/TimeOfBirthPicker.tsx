import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SelectPill } from './SelectPill';
import { TimeOfBirthPickerProps } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfile.styles';
import { HOURS, MINUTES, PERIODS } from '../EditProfile.constants';

export function TimeOfBirthPicker({
  value,
  onChange,
}: TimeOfBirthPickerProps): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.field}>
      <Text style={styles.timePickerLabel}>
        {t('edit_profile.fields.time_of_birth')}
      </Text>
      <View style={styles.timePickerRow}>
        <View style={styles.timePickerColumn}>
          <SelectPill
            label={t('edit_profile.time.hour')}
            options={HOURS.map(String)}
            value={
              value?.hour !== null && value?.hour !== undefined
                ? String(value.hour)
                : undefined
            }
            onChange={(v) =>
              onChange({
                ...(value ?? {}),
                hour: Number(v),
              })
            }
          />
        </View>

        <View style={styles.timePickerColumn}>
          <SelectPill
            label={t('edit_profile.time.minute')}
            options={MINUTES}
            value={
              value?.minute !== null && value?.minute !== undefined
                ? String(value.minute).padStart(2, '0')
                : undefined
            }
            onChange={(v) =>
              onChange({
                ...(value ?? {}),
                minute: Number(v),
              })
            }
          />
        </View>

        <View style={styles.timePickerColumn}>
          <SelectPill
            label={t('edit_profile.time.period')}
            options={PERIODS as unknown as string[]}
            value={value?.period}
            onChange={(v) => onChange({ ...value, period: v as 'AM' | 'PM' })}
          />
        </View>
      </View>
    </View>
  );
}
