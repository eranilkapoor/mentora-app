import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from '../Profile.styles';
import { RowProps } from '../Profile.types';

export function Row({ labelKey, value }: RowProps): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { t } = useTranslation();

  const displayValue = Array.isArray(value)
    ? value.filter(Boolean).join(', ') || '—'
    : value === null || (typeof value === 'string' && value.trim().length === 0)
      ? '—'
      : typeof value === 'string'
        ? value.trim()
        : String(value);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{t(labelKey)}</Text>
      <Text style={styles.rowValue}>{displayValue}</Text>
    </View>
  );
}
