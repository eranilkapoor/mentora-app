import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const settingsStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    container: {
      padding: 16,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 24,
      backgroundColor: theme.colors.white,
      borderRadius: 8,
      paddingVertical: 8,
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    row: {
      height: 56,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    rowLabel: {
      fontSize: 16,
      color: theme.colors.textPrimary,
    },
    signOutSection: {
      backgroundColor: theme.colors.white,
      borderRadius: 8,
      paddingVertical: 8,
      overflow: 'hidden',
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
    },
    signOutText: {
      color: theme.colors.danger,
      fontWeight: '600',
      fontSize: 16,
    },
  });
