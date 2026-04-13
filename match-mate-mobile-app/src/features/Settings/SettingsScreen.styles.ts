import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const settingsStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    container: {
      paddingHorizontal: 10,
      paddingTop: 10,
    },

    // ─── Profile Banner ───────────────────────────────────────────────────
    profileBanner: {
      backgroundColor: theme.colors.white,
      borderRadius: 16,
      padding: 10,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 1,
    },
    profileAvatarWrapper: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 2,
    },
    profileSubtext: {
      fontSize: 13,
      color: theme.colors.textMuted,
    },
    profileChevron: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ─── Section ──────────────────────────────────────────────────────────
    section: {
      marginBottom: 16,
      backgroundColor: theme.colors.white,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 1,
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
    },

    // ─── Row ──────────────────────────────────────────────────────────────
    row: {
      minHeight: 54,
      paddingHorizontal: 16,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    rowIconWrapper: {
      width: 34,
      height: 34,
      borderRadius: 9,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabelWrapper: {
      flex: 1,
    },
    rowLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    rowSubLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 1,
    },
    rowBadge: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginRight: 6,
    },
    rowBadgeText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // ─── Sign Out ─────────────────────────────────────────────────────────
    signOutSection: {
      backgroundColor: theme.colors.white,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 1,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: 16,
    },
    signOutText: {
      color: theme.colors.danger,
      fontWeight: '700',
      fontSize: 15,
    },

    // ─── Version ──────────────────────────────────────────────────────────
    versionText: {
      textAlign: 'center',
      fontSize: 12,
      color: theme.colors.textMuted,
      marginBottom: 8,
    },
  });
