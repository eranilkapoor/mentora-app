import { StyleSheet } from 'react-native';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';

export const subscriptionBillingStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    scrollContent: {
      ...StyleSheet.flatten(base.scrollContent),
      paddingBottom: 48,
    },
    heroCard: {
      ...StyleSheet.flatten(base.contentCard),
      borderRadius: 12,
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
      ...StyleSheet.flatten(base.metricTile),
      minHeight: 72,
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
      ...StyleSheet.flatten(base.metricTile),
      flexGrow: 1,
      flexBasis: '47%',
      minHeight: 78,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
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
      ...StyleSheet.flatten(base.listRow),
      flexDirection: 'row',
      gap: 12,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowIcon: {
      ...StyleSheet.flatten(base.optionIcon),
      width: 36,
      height: 36,
      borderRadius: 10,
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
      ...StyleSheet.flatten(base.smallPill),
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
      ...StyleSheet.flatten(base.sectionIcon),
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
    benefitValue: {
      marginTop: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: theme.colors.primaryLight,
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: '800',
    },
    badge: {
      ...StyleSheet.flatten(base.badge),
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
    footer: StyleSheet.flatten(base.footer),
  });
