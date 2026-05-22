import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';

interface Props {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  sublabel?: string;
  verified: boolean;
  isLast?: boolean;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rowLast: { borderBottomWidth: 0 },
    iconWrapper: {
      width: 34,
      height: 34,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    textWrapper: { flex: 1 },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    sublabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
  });

export function VerificationStatusRow({
  icon,
  label,
  sublabel,
  verified,
  isLast = false,
}: Props): React.ReactElement {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: verified
              ? theme.colors.successLight
              : theme.colors.primaryLight,
          },
        ]}
      >
        <Feather
          name={icon}
          size={16}
          color={verified ? theme.colors.success : theme.colors.primary}
        />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.label}>{label}</Text>
        {sublabel ? (
          <Text style={styles.sublabel}>{sublabel}</Text>
        ) : null}
      </View>

      <View
        style={[
          styles.badge,
          {
            backgroundColor: verified
              ? theme.colors.successLight
              : theme.colors.backgroundLight,
          },
        ]}
      >
        <Feather
          name={verified ? 'check-circle' : 'circle'}
          size={12}
          color={verified ? theme.colors.success : theme.colors.textMuted}
        />
        <Text
          style={[
            styles.badgeText,
            { color: verified ? theme.colors.success : theme.colors.textMuted },
          ]}
        >
          {verified ? 'Verified' : 'Unverified'}
        </Text>
      </View>
    </View>
  );
}