import { StyleSheet } from 'react-native';
import { Theme } from '@/core/theme/types';

export const subscriptionBillingStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 48,
    },
    heroCard: {
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
      padding: 16,
      marginBottom: 16,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    planLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: theme.colors.textMuted,
    },
    planTitle: {
      marginTop: 4,
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    planSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: theme.colors.textMuted,
    },
    metricStrip: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    metricTile: {
      flex: 1,
      minHeight: 72,
      borderRadius: 10,
      padding: 12,
      backgroundColor: theme.colors.backgroundLight,
      justifyContent: 'space-between',
    },
    metricValue: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    metricLabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    summaryTile: {
      flexGrow: 1,
      flexBasis: '47%',
      minHeight: 78,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      borderRadius: 10,
      padding: 12,
      justifyContent: 'space-between',
      backgroundColor: theme.colors.backgroundLight,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
    },
    value: {
      marginTop: 6,
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      lineHeight: 20,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundLight,
    },
    rowBody: {
      flex: 1,
    },
    rowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    rowTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    rowMeta: {
      marginTop: 4,
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
    rowFooter: {
      marginTop: 10,
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    smallPill: {
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 4,
      backgroundColor: theme.colors.backgroundLight,
    },
    smallPillText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    benefitRowLast: {
      borderBottomWidth: 0,
    },
    benefitIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.successLight,
    },
    benefitContent: {
      flex: 1,
    },
    benefitTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    benefitSubtitle: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textMuted,
    },
    badge: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: theme.colors.primaryLight,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.primary,
      textTransform: 'capitalize',
    },
    successBadge: {
      backgroundColor: theme.colors.successLight,
    },
    successBadgeText: {
      color: theme.colors.success,
    },
    emptyText: {
      paddingHorizontal: 14,
      paddingBottom: 14,
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
    footer: {
      height: 24,
    },
  });
