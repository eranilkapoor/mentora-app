import { Theme } from '@/core/theme/types';
import { isWeb, windowWidth } from '@/core/utils/device';
import { StyleSheet } from 'react-native';

export const profileStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 12,
      backgroundColor: theme.colors.backgroundPage,
    },
    photo: {
      width: isWeb ? 400 : windowWidth,
      height: 320,
    },
    dotRow: {
      position: 'absolute',
      bottom: 12,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.overlayDark,
    },
    dotActive: {
      backgroundColor: theme.colors.white,
      width: 18,
    },
    nameCard: {
      backgroundColor: theme.colors.white,
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    name: {
      fontSize: 22,
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
    subText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      marginBottom: 6,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      fontSize: 13,
      color: theme.colors.textMuted,
    },
    section: {
      marginTop: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 6,
      gap: 8,
    },
    sectionIconWrapper: {
      width: 24,
      height: 24,
      borderRadius: 6,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rowLabel: {
      color: theme.colors.textMuted,
      fontSize: 14,
      flex: 1,
    },
    rowValue: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '500',
      flex: 2,
      textAlign: 'right',
    },
    aboutText: {
      color: theme.colors.textBody,
      fontSize: 14,
      lineHeight: 22,
      paddingVertical: 10,
    },
    tagSection: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    tagSectionLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginBottom: 8,
    },
    tagList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
    },
    tagText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 8,
    },
    errorSubtitle: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
      marginTop: 8,
    },
    retryButtonText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 15,
    },
    skeletonContainer: {
      flex: 1,
    },
    skeletonPhoto: {
      width: windowWidth,
      height: 400,
      backgroundColor: theme.colors.backgroundLight,
    },
    skeletonHeader: {
      backgroundColor: theme.colors.white,
      padding: 16,
      gap: 8,
    },
    skeletonCard: {
      backgroundColor: theme.colors.white,
      padding: 16,
      marginTop: 12,
      gap: 8,
    },
    skeletonLine: {
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.colors.backgroundLight,
      width: '80%',
    },
    skeletonLineShort: {
      width: '50%',
    },
    footer: {
      height: 24,
    },
  });
