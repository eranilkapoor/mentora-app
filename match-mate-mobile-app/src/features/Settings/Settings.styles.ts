import { Platform, StyleSheet } from 'react-native';

import { Theme } from '@/core/theme/types';

export const settingsStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },

    container: {
      padding: 12,
      paddingBottom: 40,
    },

    pressed: {
      opacity: 0.7,
    },

    profileBanner: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 20,

      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,

      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,

      shadowColor: theme.colors.black,
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,

      ...(Platform.OS === 'web'
        ? ({
            cursor: 'pointer',
          } as never)
        : {}),
    },

    profileAvatar: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: theme.colors.primaryLight,

      alignItems: 'center',
      justifyContent: 'center',
    },

    profileContent: {
      flex: 1,
    },

    profileName: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },

    profileEmail: {
      fontSize: 13,
      color: theme.colors.textMuted,
      marginTop: 2,
    },

    progressWrapper: {
      marginTop: 10,
    },

    progressTrack: {
      height: 6,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: theme.colors.backgroundLight,
    },

    progressFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: theme.colors.primary,
    },

    progressText: {
      marginTop: 4,
      fontSize: 11,
      color: theme.colors.textMuted,
    },

    section: {
      backgroundColor: theme.colors.surface,

      borderRadius: 18,

      overflow: 'hidden',

      marginBottom: 20,

      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,

      shadowColor: theme.colors.black,
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 10,

      paddingHorizontal: 16,
      paddingVertical: 13,

      borderBottomWidth: StyleSheet.hairlineWidth,

      borderBottomColor: theme.colors.divider,
    },

    sectionIconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 8,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: theme.colors.primaryLight,
    },

    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.primary,
    },

    row: {
      minHeight: 64,

      paddingHorizontal: 16,
      paddingVertical: 10,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      borderBottomWidth: StyleSheet.hairlineWidth,

      borderBottomColor: theme.colors.divider,

      ...(Platform.OS === 'web'
        ? ({
            cursor: 'pointer',
          } as never)
        : {}),
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
      width: 38,
      height: 38,
      borderRadius: 10,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: theme.colors.backgroundLight,
    },

    rowLabelWrapper: {
      flex: 1,
    },

    rowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },

    rowSubLabel: {
      marginTop: 2,

      fontSize: 12,
      color: theme.colors.textMuted,
    },

    rowDangerLabel: {
      color: theme.colors.danger,
    },

    rowBadge: {
      backgroundColor: theme.colors.primaryLight,

      borderRadius: 8,

      paddingHorizontal: 8,
      paddingVertical: 4,

      marginRight: 8,
    },

    rowBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.primary,
    },

    footer: {
      marginTop: 10,
      alignItems: 'center',
    },

    footerText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },

    footerSubtext: {
      marginTop: 4,
      fontSize: 12,
      color: theme.colors.textMuted,
    },

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: theme.colors.overlayLight,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    dangerRow: {
      backgroundColor: theme.colors.errorLight,
    },
    rowDisabled: {
      opacity: 0.5,
    },
  });
