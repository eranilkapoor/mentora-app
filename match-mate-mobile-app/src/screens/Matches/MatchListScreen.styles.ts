import { Theme } from '@/core/theme/types';
import { Platform, StyleSheet } from 'react-native';

export const matchListStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    listContent: {
      flexGrow: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginTop: 8,
    },
    header: {
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    filterText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    searchBox: {
      margin: 12,
      marginBottom: 8,
      backgroundColor: theme.colors.white,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.05)`,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    searchInput: {
      flex: 1,
      height: 44,
      color: theme.colors.textPrimary,
      fontSize: 14,
    },
    clearButton: {
      padding: 4,
      marginLeft: 8,
    },
    clearText: {
      color: theme.colors.textMuted,
      fontSize: 18,
      fontWeight: '600',
    },
    resultsCount: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    resultsText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    card: {
      backgroundColor: theme.colors.white,
      marginHorizontal: 12,
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          boxShadow: `0px 2px 8px rgba(0, 0, 0, 0.01)`,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    photo: {
      width: '100%',
      height: 280,
    },
    photoWrapper: {
      position: 'relative',
    },
    photoOverlay: {
      position: 'absolute',
      bottom: 0,
      height: 120,
      width: '100%',
      backgroundColor: theme.colors.black,
    },
    badgeRow: {
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      gap: 8,
    },
    newBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    newBadgeText: {
      color: theme.colors.white,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    onlineBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.black,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      gap: 4,
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.success,
    },
    onlineBadgeText: {
      color: theme.colors.white,
      fontSize: 11,
      fontWeight: '600',
    },
    nameOverlay: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
    },
    nameOverlayText: {
      color: theme.colors.white,
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 2,
    },
    locationOverlayText: {
      color: theme.colors.white,
      fontSize: 13,
      opacity: 0.9,
    },
    info: {
      padding: 14,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    tag: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    tagText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    metaRow: {
      marginTop: 12,
      marginBottom: 14,
      gap: 6,
    },
    metaText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    outlineBtn: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 14,
    },
    primaryBtn: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
