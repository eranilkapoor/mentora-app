import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const chatListStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },

    // ─── Header ───────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 2,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerIconWrapper: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    headerSub: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 1,
    },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundLight,
    },
    filterText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    filterRail: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    filterContent: {
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    filterChip: {
      minHeight: 34,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 11,
      borderRadius: 17,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundLight,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    filterChipTextActive: {
      color: theme.colors.white,
    },
    filterCount: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
    },
    filterCountActive: {
      backgroundColor: theme.colors.surface,
    },
    filterCountText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    filterCountTextActive: {
      color: theme.colors.primary,
    },

    // ─── Search ───────────────────────────────────────────────────────────
    searchWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      gap: 8,
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      height: 42,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },

    // ─── List ─────────────────────────────────────────────────────────────
    listContent: {
      paddingTop: 8,
      paddingBottom: 32,
    },

    // ─── Chat Card ────────────────────────────────────────────────────────
    card: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 13,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      alignItems: 'center',
    },
    cardUnread: {
      backgroundColor: theme.colors.primaryLight,
    },
    cardPressed: {
      opacity: 0.75,
    },

    // ─── Avatar ───────────────────────────────────────────────────────────
    avatarWrap: {
      marginRight: 12,
      position: 'relative',
    },
    avatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      borderWidth: 2,
      borderColor: theme.colors.divider,
    },
    avatarUnread: {
      borderColor: theme.colors.primary,
    },
    onlineDot: {
      position: 'absolute',
      right: 1,
      bottom: 1,
      width: 13,
      height: 13,
      borderRadius: 7,
      backgroundColor: theme.colors.success,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },

    // ─── Info ─────────────────────────────────────────────────────────────
    info: {
      flex: 1,
      justifyContent: 'center',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    nameUnread: {
      fontWeight: '800',
      color: theme.colors.primary,
    },
    time: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginLeft: 8,
    },
    timeUnread: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    cityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    city: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    lastMessage: {
      fontSize: 13,
      color: theme.colors.textMuted,
      flex: 1,
      marginRight: 8,
    },
    lastMessageUnread: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    typingText: {
      color: theme.colors.success,
      fontWeight: '700',
    },
    lastStatusWrap: {
      width: 19,
      height: 14,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 4,
    },
    lastStatusSecondTick: {
      marginLeft: -8,
    },
    quickActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    quickActionBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundLight,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    quickActionBtnActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primaryBorder,
    },
    loadingMoreText: {
      paddingVertical: 16,
      textAlign: 'center',
      color: theme.colors.textMuted,
      fontWeight: '600',
    },

    // ─── Badge ────────────────────────────────────────────────────────────
    badge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: theme.colors.white,
      fontSize: 11,
      fontWeight: '800',
    },

    // ─── Loading ──────────────────────────────────────────────────────────
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },

    // ─── Skeleton ─────────────────────────────────────────────────────────
    skeletonCard: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 14,
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
      gap: 12,
    },
    skeletonAvatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: theme.colors.backgroundLight,
    },
    skeletonLines: {
      flex: 1,
      gap: 8,
    },
    skeletonLine: {
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.backgroundLight,
    },
    skeletonLineShort: {
      width: '60%',
    },

    // ─── Empty ────────────────────────────────────────────────────────────
    emptyWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      gap: 12,
    },
    emptyIconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    emptySub: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    emptyBtn: {
      marginTop: 8,
      paddingHorizontal: 24,
      paddingVertical: 11,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
    },
    emptyBtnText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
  });
