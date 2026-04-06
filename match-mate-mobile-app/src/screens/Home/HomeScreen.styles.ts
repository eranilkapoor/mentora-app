import { StyleSheet } from 'react-native';
import { isWeb, windowWidth } from '../../core/utils/device';
import { Theme } from '@/core/theme/types';

export const homeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    listContent: {
      paddingBottom: 24,
    },
    card: {
      backgroundColor: theme.colors.white,
      marginHorizontal: 12,
      marginTop: 16,
      borderRadius: 14,
      overflow: 'hidden',
      elevation: 3,
      boxShadow: `0px 2px 8px rgba(0, 0, 0, 0.08)`,
    },
    photo: {
      width: isWeb ? 375 : windowWidth - 24,
      height: 320,
    },
    photoBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.overlayDark,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    photoBadgeText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: '600',
    },
    cardContent: {
      padding: 16,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    name: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    verifiedText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    meta: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: 12,
    },
    infoGrid: {
      gap: 6,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    value: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    actions: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 10,
    },
    chatBtn: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.colors.chatBtn,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    chatText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
    viewBtn: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.colors.backgroundLight,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    viewText: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
      fontSize: 14,
    },
    shortlistBtn: {
      width: 48,
      backgroundColor: theme.colors.shortlistBg,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
