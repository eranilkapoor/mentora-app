import { StyleSheet, Platform } from 'react-native';
import { isWeb, windowWidth } from '../../core/utils/device';
import { Theme } from '@/core/theme/types';

export const homeStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    listContent: {
      paddingBottom: 32,
    },

    // ─── Welcome Banner ───────────────────────────────────────────────────
    welcomeBanner: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    welcomeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    welcomeAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: theme.colors.primaryLight,
    },
    welcomeGreeting: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    welcomeName: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    notifBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.danger,
      borderWidth: 1.5,
      borderColor: theme.colors.white,
    },

    // ─── Quick Stats ──────────────────────────────────────────────────────
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
      backgroundColor: theme.colors.white,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 8,
      alignItems: 'center',
      gap: 3,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.primaryBorder,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 10,
      color: theme.colors.textMuted,
      fontWeight: '500',
      textAlign: 'center',
    },

    // ─── Section Header ───────────────────────────────────────────────────
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 10,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    seeAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    seeAllText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '600',
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
      ...Platform.select({ android: { elevation: 3 } }),
    },

    // ─── Photo ────────────────────────────────────────────────────────────
    photoWrapper: { position: 'relative' },
    photo: {
      width: isWeb ? 375 : windowWidth - 32,
      height: 340,
    },
    photoScrim: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 160,
      backgroundColor: theme.colors.overlayDark,
    },
    photoBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    photoBadgeText: {
      color: theme.colors.white,
      fontSize: 11,
      fontWeight: '600',
    },
    onlineBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(0,0,0,0.45)',
      paddingHorizontal: 9,
      paddingVertical: 4,
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
      position: 'absolute',
      top: 44,
      left: 12,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 20,
    },
    newBadgeText: {
      color: theme.colors.white,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    photoOverlay: {
      position: 'absolute',
      bottom: 12,
      left: 14,
      right: 14,
    },
    heroName: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.white,
      marginBottom: 3,
    },
    heroLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    heroLocation: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.9)',
    },

    // ─── Card Content ─────────────────────────────────────────────────────
    cardContent: { padding: 14 },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
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
    meta: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
      marginBottom: 14,
    },

    // ─── Actions ──────────────────────────────────────────────────────────
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    chatBtn: {
      flex: 2,
      flexDirection: 'row',
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      elevation: 3,
    },
    chatText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
    viewBtn: {
      flex: 2,
      flexDirection: 'row',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    viewText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 14,
    },
    shortlistBtn: {
      width: 46,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accentLight,
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
      height: 340,
      backgroundColor: theme.colors.backgroundLight,
    },
    skeletonContent: {
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

    // ─── Empty ────────────────────────────────────────────────────────────
    emptyWrapper: {
      paddingVertical: 60,
      paddingHorizontal: 32,
      alignItems: 'center',
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
    emptySub: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
