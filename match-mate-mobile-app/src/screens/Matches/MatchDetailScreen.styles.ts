import { Theme } from '@/core/theme/types';
import { isWeb, windowWidth } from '@/core/utils/device';
import { StyleSheet } from 'react-native';

export const matchDetailStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundPage },

    photo: {
      width: isWeb ? 400 : windowWidth,
      height: 380,
    },

    carouselWrapper: { position: 'relative' },

    carouselScrim: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: 160,
      backgroundColor: theme.colors.overlayDark,
    },

    counterPill: {
      position: 'absolute',
      top: 14,
      right: 14,
      backgroundColor: theme.colors.overlayDark,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },

    counterText: { color: theme.colors.white, fontSize: 12, fontWeight: '700' },
    sectionIcon: {
      fontSize: 16,
      marginRight: 8,
    },

    sectionBody: {
      gap: 4, // spacing between rows (RN 0.71+)
    },

    dots: {
      position: 'absolute',
      bottom: 54,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },

    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.white,
    },

    dotActive: {
      backgroundColor: theme.colors.white,
      width: 18,
    },

    heroOverlay: {
      position: 'absolute',
      bottom: 14,
      left: 14,
      right: 14,
    },

    onlinePill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.overlayDark,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 6,
    },

    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.success,
      marginRight: 5,
    },

    onlinePillText: {
      color: theme.colors.white,
      fontSize: 11,
      fontWeight: '700',
    },

    heroName: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.white,
    },

    heroLocation: {
      fontSize: 13,
      color: theme.colors.white,
      opacity: 0.85,
    },

    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      padding: 14,
      backgroundColor: theme.colors.white,
      borderBottomWidth: 1,
      borderColor: theme.colors.divider,
    },

    chip: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },

    chipText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    section: {
      backgroundColor: theme.colors.white,
      marginTop: 10,
      padding: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.divider,
    },

    sectionHeader: {
      flexDirection: 'row',
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },

    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: theme.colors.divider,
    },

    label: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },

    value: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },

    cta: {
      position: 'absolute',
      bottom: 0,
      flexDirection: 'row',
      padding: 16,
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },

    ctaOutline: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: 30,
      alignItems: 'center',
      padding: 13,
    },

    ctaOutlineText: {
      color: theme.colors.primary,
      fontWeight: '700',
    },

    ctaPrimary: {
      flex: 2,
      backgroundColor: theme.colors.primary,
      borderRadius: 30,
      alignItems: 'center',
      padding: 13,
      marginLeft: 10,
    },

    ctaPrimaryText: {
      color: theme.colors.white,
      fontWeight: '800',
    },
  });
