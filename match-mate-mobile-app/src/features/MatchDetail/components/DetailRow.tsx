import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchDetailStyles } from '../MatchDetail.styles';
import { EMPTY } from '../MatchDetail.constants';

interface Props {
  label: string;
  value?: string | number | null;
  icon?: React.ComponentProps<typeof Feather>['name'];
  isLast?: boolean;
}

export function DetailRow({
  label,
  value,
  icon,
  isLast = false,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const { theme } = useTheme();

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowLeft}>
        {icon !== undefined && (
          <Feather name={icon} size={13} color={theme.colors.textMuted} />
        )}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={2}>
        {value ?? EMPTY}
      </Text>
    </View>
  );
}
