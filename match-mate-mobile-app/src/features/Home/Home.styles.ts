import { StyleSheet, Platform } from 'react-native';
import { isWeb, windowWidth } from '@/core/utils/device';
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
    listFooter: {
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ─── Stats ────────────────────────────────────────────────────────────
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
      backgroundColor: theme.colors.surface,
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
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      ...Platform.select({
        android: { elevation: 3 },
        ios: {
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        web: {},
      }),
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
      backgroundColor: theme.colors.overlayLight,
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
      backgroundColor: theme.colors.overlayLight,
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
      left: 12,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 20,
    },
    newBadgeOnline: { top: 44 },
    newBadgeDefault: { top: 12 },
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
      color: theme.colors.white,
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
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    chatBtnPending: {
      backgroundColor: theme.colors.error,
    },
    chatText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
    viewBtn: {
      flex: 1,
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
      width: 44,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
    },
    shortlistBtnActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },

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
