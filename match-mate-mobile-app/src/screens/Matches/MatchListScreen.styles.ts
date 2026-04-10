import { Theme } from '@/core/theme/types';
import { Platform, StyleSheet } from 'react-native';

export const matchListStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    listContent: {
      paddingBottom: 32,
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

    // ─── Search ───────────────────────────────────────────────────────────
    searchWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.colors.white,
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

    // ─── Results Count ────────────────────────────────────────────────────
    resultsBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    resultsText: {
      fontSize: 13,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },
    resultsHighlight: {
      color: theme.colors.primary,
      fontWeight: '700',
    },

    // ─── Card ─────────────────────────────────────────────────────────────
    card: {
      backgroundColor: theme.colors.white,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      ...Platform.select({
        android: { elevation: 3 },
      }),
    },

    // ─── Photo ────────────────────────────────────────────────────────────
    photo: {
      width: '100%',
      height: 300,
    },
    photoWrapper: { position: 'relative' },
    photoScrim: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 140,
      backgroundColor: theme.colors.overlayDark,
    },
    badgeRow: {
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      gap: 6,
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
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      gap: 5,
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
      fontWeight: '600',
    },
    nameOverlay: {
      position: 'absolute',
      bottom: 12,
      left: 14,
      right: 14,
    },
    nameOverlayText: {
      color: theme.colors.white,
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 3,
    },
    locationOverlayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    locationOverlayText: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 13,
    },

    // ─── Info ─────────────────────────────────────────────────────────────
    info: {
      padding: 14,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: 7,
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    tag: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.primaryBorder,
    },
    tagText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    metaRow: {
      gap: 5,
      marginBottom: 14,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },

    // ─── Actions ──────────────────────────────────────────────────────────
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    outlineBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
    },
    outlineText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },
    primaryBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      elevation: 3,
    },
    primaryText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 13,
    },

    // ─── Skeleton ─────────────────────────────────────────────────────────
    skeletonCard: {
      backgroundColor: theme.colors.white,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    skeletonPhoto: {
      width: '100%',
      height: 300,
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
    skeletonLineShort: { width: '55%' },
    skeletonLineXShort: { width: '35%' },

    // ─── Loading / Empty ──────────────────────────────────────────────────
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      color: theme.colors.textMuted,
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
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
      textAlign: 'center',
    },
    emptySubtitle: {
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