import { Theme } from '@/core/theme/types';
import { Platform, StyleSheet } from 'react-native';

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

    // ── Master card ───────────────────────────────────────────────────────────
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

    // ── Quick actions ─────────────────────────────────────────────────────────
    quickActions: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
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

    // ── Section card ──────────────────────────────────────────────────────────
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      // Fixed: RN shadow instead of CSS boxShadow
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

    // ── Notification row ──────────────────────────────────────────────────────
    notifRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 14,
    },
    rowIconWrapper: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    rowIconWrapperDisabled: {
      backgroundColor: theme.colors.backgroundLight,
    },
    toggleWrapper: {
      flex: 1,
    },
    rowDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
      marginLeft: 58,
    },
    footer: {
      height: 24,
    },
  });
