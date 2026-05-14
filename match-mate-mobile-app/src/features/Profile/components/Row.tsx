import { View, Text } from 'react-native';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { RowProps } from '../Profile.types';
import { profileStyles } from '../Profile.styles';

export function Row({ label, value }: RowProps): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const displayValue = Array.isArray(value)
    ? value.filter(Boolean).join(', ') || '—'
    : value === undefined || value === null || value.trim().length === 0
      ? '—'
      : value.trim();

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{displayValue}</Text>
    </View>
  );
}
