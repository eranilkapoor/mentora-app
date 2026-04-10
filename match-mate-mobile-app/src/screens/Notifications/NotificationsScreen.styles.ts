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
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 40,
    },

    // ─── Header Card ──────────────────────────────────────────────────────
    headerCard: {
      backgroundColor: theme.colors.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 1,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    markAllBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    markAllText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // ─── Section Card ─────────────────────────────────────────────────────
    sectionCard: {
      backgroundColor: theme.colors.white,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 1,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    sectionIconWrapper: {
      width: 26,
      height: 26,
      borderRadius: 7,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      flex: 1,
    },
    sectionCount: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.white,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 10,
    },

    // ─── Notification Item ────────────────────────────────────────────────
    notifItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    notifItemLast: {
      borderBottomWidth: 0,
    },
    notifItemUnread: {
      backgroundColor: theme.colors.primaryLight,
    },
    notifIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifIconWrapperUnread: {
      backgroundColor: theme.colors.primaryLight,
    },
    notifContent: {
      flex: 1,
    },
    notifTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    notifTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    notifTitleUnread: {
      color: theme.colors.primary,
    },
    notifTime: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginLeft: 8,
    },
    notifMessage: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      marginTop: 4,
    },

    // ─── Empty State ──────────────────────────────────────────────────────
    emptyCard: {
      backgroundColor: theme.colors.white,
      borderRadius: 16,
      padding: 40,
      alignItems: 'center',
      gap: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 1,
    },
    emptyIconWrapper: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 19,
    },
  });
