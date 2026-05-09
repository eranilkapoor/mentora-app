import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const onlineMatchesStyles = (theme: Theme) =>
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
      backgroundColor: theme.colors.white,
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
    onlineCountText: {
      color: theme.colors.success,
      fontWeight: '700',
    },
    liveIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.primaryBorder,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    liveText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.primary,
      letterSpacing: 1,
    },

    // ─── List ─────────────────────────────────────────────────────────────
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 32,
    },

    // ─── Card ─────────────────────────────────────────────────────────────
    card: {
      marginBottom: 16,
      borderRadius: 18,
      backgroundColor: theme.colors.white,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 3,
    },

    // ─── Photo ────────────────────────────────────────────────────────────
    photoWrapper: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: 260,
    },
    photoScrim: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 130,
      backgroundColor: theme.colors.overlayDark,
    },
    badgeRow: {
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      gap: 6,
    },
    onlineBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: theme.colors.black,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.success,
    },
    onlineBadgeText: {
      color: theme.colors.white,
      fontSize: 11,
      fontWeight: '700',
    },
    newBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    newBadgeText: {
      color: theme.colors.white,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    nameOverlay: {
      position: 'absolute',
      bottom: 12,
      left: 14,
      right: 14,
    },
    nameOverlayText: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.white,
      marginBottom: 3,
    },
    cityOverlayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    cityOverlayText: {
      fontSize: 13,
      color: theme.colors.accentLight,
    },

    // ─── Info ─────────────────────────────────────────────────────────────
    info: { padding: 14 },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
      marginBottom: 13,
    },
    tag: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.primaryBorder,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // ─── Actions ──────────────────────────────────────────────────────────
    actions: { flexDirection: 'row', gap: 10 },
    chatBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      elevation: 3,
    },
    chatText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 13,
    },
    profileBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    profileText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },

    // ─── Skeleton ─────────────────────────────────────────────────────────
    skeletonCard: {
      marginBottom: 16,
      borderRadius: 18,
      backgroundColor: theme.colors.white,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    skeletonPhoto: {
      width: '100%',
      height: 260,
      backgroundColor: theme.colors.backgroundLight,
    },
    skeletonInfo: {
      padding: 14,
      gap: 10,
    },
    skeletonLine: {
      height: 13,
      borderRadius: 6,
      backgroundColor: theme.colors.backgroundLight,
    },
    skeletonLineShort: { width: '50%' },

    // ─── States ───────────────────────────────────────────────────────────
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 32,
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
    loadingText: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    emptySub: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
