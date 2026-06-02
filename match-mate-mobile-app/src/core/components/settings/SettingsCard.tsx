import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  children: React.ReactNode;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      overflow: 'hidden',
      ...Platform.select({
        web: {},
        default: {
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        },
      }),
    },
    header: {
      paddingHorizontal: 14,
      paddingVertical: 12,

      flexDirection: 'row',
      alignItems: 'center',

      backgroundColor: theme.colors.backgroundPage,

      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,

      gap: 8,
    },
    headerText: { flex: 1 },
    title: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
  });

export function SettingsCard({
  title,
  subtitle,
  icon,
  children,
}: Props): React.ReactElement {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon ? (
          <Feather name={icon} size={15} color={theme.colors.primary} />
        ) : null}
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}
