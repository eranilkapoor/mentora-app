import { Theme } from '@/core/theme/types';
import { isWeb, windowWidth } from '@/core/utils/device';
import { StyleSheet } from 'react-native';

export const matchDetailStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },

    // ─── Carousel ─────────────────────────────────────────────────────────
    carouselWrapper: { position: 'relative' },
    photo: {
      width: isWeb ? 400 : windowWidth,
      height: 420,
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
      backgroundColor: 'rgba(0,0,0,0.45)',
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
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
      backgroundColor: theme.colors.white,
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
      backgroundColor: 'rgba(0,0,0,0.45)',
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
      color: 'rgba(255,255,255,0.85)',
    },

    // ─── Match Score ──────────────────────────────────────────────────────
    matchScoreBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.white,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      gap: 12,
    },
    matchScoreLeft: {
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
      backgroundColor: theme.colors.white,
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
      backgroundColor: theme.colors.white,
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
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
      paddingHorizontal: 16,
      paddingVertical: 14,
    },

    // ─── CTA ──────────────────────────────────────────────────────────────
    cta: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 28,
      backgroundColor: theme.colors.white,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      gap: 10,
      elevation: 12,
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
      elevation: 4,
    },
    ctaPrimaryText: {
      color: theme.colors.white,
      fontWeight: '800',
      fontSize: 14,
    },

    // ─── Footer spacer ────────────────────────────────────────────────────
    footerSpacer: { height: 110 },
  });