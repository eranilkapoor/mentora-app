import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const notificationStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    empty: {
      textAlign: 'center',
      marginTop: 40,
      color: theme.colors.textMuted,
    },
    innerContainer: {
      flexDirection: 'row',
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundPage,
    },
    unread: {
      backgroundColor: theme.colors.backgroundPage,
    },
    icon: {
      marginRight: 12,
      marginTop: 4,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontWeight: '600',
      fontSize: 14,
      marginBottom: 2,
      color: theme.colors.textPrimary,
    },
    message: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    time: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
  });
