import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const notificationSettingsStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 48,
    },
    masterCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
    },
    masterLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    masterIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    masterLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    masterSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    quickActions: {
      flexDirection: 'row',
      backgroundColor: theme.colors.white,
      borderRadius: 10,
      marginBottom: 20,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    quickActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
    },
    quickActionDivider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
    },
    quickActionText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    quickActionTextDanger: {
      color: theme.colors.danger,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      elevation: 1,
      boxShadow: `0px 1px 4px rgba(0, 0, 0, 0.04)`,
    },
    cardHeader: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.backgroundPage,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    rowDisabled: {
      opacity: 0.5,
    },
    rowIconWrapper: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    rowTextWrapper: {
      flex: 1,
      marginRight: 8,
    },
    rowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    rowDescription: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    rowDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
      marginLeft: 60,
    },
    textDisabled: {
      color: theme.colors.textMuted,
    },
    footer: {
      height: 24,
    },
  });
