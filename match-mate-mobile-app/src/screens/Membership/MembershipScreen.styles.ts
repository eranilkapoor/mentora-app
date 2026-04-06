import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const membershipStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    scroll: {
      paddingHorizontal: 16,
      paddingBottom: 110,
    },

    // Page title
    pageTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginTop: 20,
    },
    pageSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
      marginBottom: 20,
    },

    // Tabs
    tabs: {
      flexDirection: 'row',
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: 10,
      padding: 4,
      marginTop: 16,
      marginBottom: 20,
    },
    tab: {
      flex: 1,
      paddingVertical: 9,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      elevation: 2,
    },
    tabText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: '700',
    },

    // Refund banner
    refundBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.successLight,
      borderRadius: 10,
      padding: 12,
      marginBottom: 20,
      gap: 10,
    },
    refundIcon: { fontSize: 20 },
    refundText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.success,
    },
    refundSub: {
      fontSize: 11,
      color: theme.colors.success,
      marginTop: 2,
    },

    // Plan cards
    planRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
      gap: 8,
    },
    planCard: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      position: 'relative',
    },
    planCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
      elevation: 4,
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      backgroundColor: theme.colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    popularBadgeText: {
      color: theme.colors.white,
      fontSize: 10,
      fontWeight: '700',
    },
    planName: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textBody,
      marginTop: 8,
    },
    planNameActive: {
      color: theme.colors.primary,
    },
    planPrice: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginTop: 4,
    },
    planPriceActive: {
      color: theme.colors.primary,
    },
    planDuration: {
      fontSize: 10,
      color: theme.colors.textMuted,
      marginBottom: 10,
    },
    // Radio
    radioOuter: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      marginTop: 4,
    },
    radioOuterActive: {
      borderColor: theme.colors.primary,
    },
    radioInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },

    // Feature table
    featureHeader: {
      flexDirection: 'row',
      paddingVertical: 10,
      borderBottomWidth: 2,
      borderColor: theme.colors.primary,
      marginBottom: 2,
    },
    featureHeaderLabel: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    featureHeaderCol: {
      flex: 1,
      textAlign: 'center',
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    featureHeaderColActive: {
      color: theme.colors.primary,
      fontWeight: '800',
    },

    featureTable: {
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      marginBottom: 20,
    },
    featureRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderColor: theme.colors.divider,
      alignItems: 'center',
    },
    featureLabel: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.textBody,
    },
    featureValues: {
      flexDirection: 'row',
      width: '45%',
      justifyContent: 'space-around',
    },
    featureCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 2,
      borderRadius: 4,
      marginHorizontal: 2,
    },
    featureCellActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    featureValue: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textBody,
      textAlign: 'center',
    },
    featureValueActive: {
      color: theme.colors.primary,
    },
    featureCheck: {
      color: theme.colors.success,
    },
    featureZero: {
      color: theme.colors.textMuted,
    },

    // Trust badges
    trustRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      gap: 8,
    },
    trustBadge: {
      flex: 1,
      backgroundColor: theme.colors.white,
      borderRadius: 20,
      paddingVertical: 6,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    trustText: {
      fontSize: 11,
      color: theme.colors.textBody,
      fontWeight: '500',
    },

    // CTA
    ctaContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 24,
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderColor: theme.colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      elevation: 10,
    },
    ctaInfo: {
      flex: 1,
    },
    ctaPlan: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    ctaPrice: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    ctaButton: {
      flex: 2,
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: 'center',
      elevation: 6,
    },
    ctaButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.3,
    },

    ///////////////////
    planMonths: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textBody,
    },
    planMonthsActive: {
      color: theme.colors.primary,
    },
    oldPrice: {
      fontSize: 11,
      textDecorationLine: 'line-through',
      color: theme.colors.textMuted,
      marginBottom: 6,
    },
    perMonthBadge: {
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    perMonthText: {
      fontSize: 9,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    ctaDuration: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    sectionLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    exclusivePill: {
      backgroundColor: theme.colors.accentLight,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginRight: 10,
    },
    exclusivePillText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.accent,
      letterSpacing: 1,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.divider,
    },
    // Card
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      overflow: 'hidden',
      marginBottom: 20,
      elevation: 2,
    },
    cardTopAccent: {
      height: 4,
      backgroundColor: theme.colors.accent,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 14,
      paddingTop: 14,
      gap: 8,
    },
    benefitIcon: { fontSize: 18 },
    benefitText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginHorizontal: 14,
      marginTop: 12,
    },
    pointsContainer: {
      paddingHorizontal: 14,
      paddingTop: 10,
    },
    pointRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 4,
      gap: 8,
    },
    pointDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      marginTop: 6,
    },
    pointText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.textBody,
      lineHeight: 20,
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 14,
    },
    callbackBtn: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
    },
    callbackText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 12,
    },
    knowMoreText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 13,
    },
    // Offer banner
    offerBanner: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 10,
      paddingVertical: 10,
      marginBottom: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
    },
    offerEmoji: { fontSize: 16 },
    offerText: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },
    // Savings
    savingsRow: {
      backgroundColor: theme.colors.successLight,
      borderRadius: 10,
      padding: 10,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.success,
    },
    savingsText: {
      fontSize: 12,
      color: theme.colors.success,
      lineHeight: 18,
    },
    savingsHighlight: {
      fontWeight: '800',
    },
  });
