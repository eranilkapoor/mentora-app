import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const accountSettingsStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },

    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },

    section: {
      marginBottom: 18,
    },

    sectionHeader: {
      marginBottom: 10,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },

    sectionSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textMuted,
    },

    sectionBody: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      overflow: 'hidden',
    },

    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },

    infoLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    infoContent: {
      flex: 1,
    },

    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },

    infoDescription: {
      marginTop: 3,
      fontSize: 12,
      color: theme.colors.textMuted,
    },

    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },

    badgeSuccess: {
      backgroundColor: theme.colors.successLight,
    },

    badgeWarning: {
      backgroundColor: theme.colors.warningLight,
    },

    badgeText: {
      fontSize: 11,
      fontWeight: '700',
    },

    badgeTextSuccess: {
      color: theme.colors.success,
    },

    badgeTextWarning: {
      color: theme.colors.warning,
    },

    linkedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },

    linkedLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    linkedTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },

    connectButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.colors.primary,
    },

    disconnectButton: {
      backgroundColor: theme.colors.errorLight,
    },

    connectButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.white,
    },

    disconnectButtonText: {
      color: theme.colors.error,
    },

    dangerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
    },

    dangerContent: {
      marginBottom: 12,
    },

    dangerTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.error,
    },

    dangerDescription: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textMuted,
    },

    dangerButton: {
      height: 42,
      borderRadius: 10,
      backgroundColor: theme.colors.warning,
      alignItems: 'center',
      justifyContent: 'center',
    },

    deleteButton: {
      backgroundColor: theme.colors.error,
    },

    dangerButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.white,
    },

    emptyText: {
      fontSize: 13,
      color: theme.colors.textMuted,
      paddingVertical: 12,
    },
  });
