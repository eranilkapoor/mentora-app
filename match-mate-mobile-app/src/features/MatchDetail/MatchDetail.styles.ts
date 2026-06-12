import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { Platform, StyleSheet } from 'react-native';

export const matchDetailStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    container: StyleSheet.flatten(base.container),

    // ─── Carousel ─────────────────────────────────────────────────────────
    carouselWrapper: { position: 'relative' },
    photo: {
      width: '100%',
      height: 420,
    },
    photoPrivacyFrame: {
      width: '100%',
      height: 420,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: theme.colors.backgroundLight,
    },
    photoPrivacyOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.overlayDark,
      gap: 8,
    },
    photoPrivacyText: {
      color: theme.colors.white,
      fontSize: 13,
      fontWeight: '700',
    },
    carouselScrim: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: 200,
      backgroundColor: theme.colors.overlayDark,
    },
    counterPill: {
      position: 'absolute',
      top: 14,
      right: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.overlayDark,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    counterText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: '700',
    },
    dots: {
      position: 'absolute',
      bottom: 68,
      width: '100%',
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
      backgroundColor: theme.colors.surface,
      width: 20,
    },

    // ─── Hero Overlay ─────────────────────────────────────────────────────
    heroOverlay: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
    },
    onlinePill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.success,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 8,
      gap: 5,
    },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.success,
    },
    onlinePillText: {
      color: theme.colors.white,
      fontSize: 11,
      fontWeight: '700',
    },
    heroName: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.colors.white,
      marginBottom: 4,
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

    // ─── Match Score ──────────────────────────────────────────────────────
    matchScoreBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      gap: 12,
    },
    matchScoreLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    matchScoreIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    matchScoreLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    matchScoreValue: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    matchScoreDivider: {
      width: StyleSheet.hairlineWidth,
      height: 36,
      backgroundColor: theme.colors.divider,
    },

    // ─── Chips ────────────────────────────────────────────────────────────
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.primaryBorder,
    },
    chipText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // ─── Section ──────────────────────────────────────────────────────────
    section: {
      backgroundColor: theme.colors.surface,
      marginTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    sectionIconWrapper: {
      width: 30,
      height: 30,
      borderRadius: 9,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    sectionBody: {
      paddingHorizontal: 16,
    },

    // ─── Row ──────────────────────────────────────────────────────────────
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    rowLast: { borderBottomWidth: 0 },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    label: {
      fontSize: 13,
      color: theme.colors.textMuted,
    },
    value: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'right',
      flex: 1,
      marginLeft: 16,
    },

    // ─── About ────────────────────────────────────────────────────────────
    aboutText: {
      fontSize: 14,
      color: theme.colors.textBody,
      lineHeight: 22,
      paddingVertical: 14,
    },

    // ─── Safety ───────────────────────────────────────────────────────────
    safetyActions: {
      flexDirection: 'row',
      gap: 10,
      paddingVertical: 14,
    },
    safetyButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      backgroundColor: theme.colors.backgroundLight,
      paddingVertical: 12,
    },
    safetyButtonDanger: {
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.errorLight,
    },
    safetyButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    safetyButtonTextDanger: { color: theme.colors.error },

    // ─── CTA ──────────────────────────────────────────────────────────────
    cta: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 28,
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      gap: 10,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        android: { elevation: 12 },
        web: {},
      }),
    },
    ctaOutline: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: 30,
      paddingVertical: 13,
    },
    ctaOutlineText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 14,
    },
    ctaPrimary: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 30,
      paddingVertical: 13,
      ...Platform.select({
        android: { elevation: 4 },
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        web: {},
      }),
    },
    ctaPrimaryDisabled: {
      backgroundColor: theme.colors.textMuted,
      elevation: 0,
      shadowOpacity: 0,
    },
    ctaPrimaryText: {
      color: theme.colors.white,
      fontWeight: '800',
      fontSize: 14,
    },

    // ─── Empty ────────────────────────────────────────────────────────────
    footerSpacer: { height: 110 },
    emptyContainer: {
      flex: 1,
      minHeight: 360,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      gap: 16,
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
  });
