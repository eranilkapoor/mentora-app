import { StyleSheet } from 'react-native';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';

export const referRewardsStyles = (
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
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
      padding: 16,
      marginBottom: 16,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      color: theme.colors.textMuted,
    },
    title: {
      marginTop: 4,
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: theme.colors.textMuted,
      lineHeight: 19,
    },
    codeBox: {
      marginTop: 16,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
      padding: 14,
    },
    codeLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    codeRow: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    codeText: {
      flex: 1,
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: 0,
      color: theme.colors.primary,
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
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
    shareRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 14,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 9,
      backgroundColor: theme.colors.backgroundLight,
    },
    shareButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    walletSummaryRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 14,
      paddingBottom: 14,
    },
    walletBalanceTile: {
      flex: 1,
      minHeight: 74,
      borderRadius: 10,
      padding: 12,
      backgroundColor: theme.colors.backgroundLight,
      justifyContent: 'space-between',
    },
    walletBalanceValue: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.colors.primary,
    },
    walletBalanceLabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '700',
    },
    rewardRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rewardRowLast: {
      borderBottomWidth: 0,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
    },
    avatarText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    rowBody: {
      flex: 1,
    },
    rowTop: {
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
    pointsText: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.success,
    },
    rowMeta: {
      marginTop: 4,
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
    badge: {
      marginTop: 10,
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 4,
      backgroundColor: theme.colors.backgroundLight,
    },
    badgeText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    emptyText: {
      paddingHorizontal: 14,
      paddingBottom: 14,
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
  });
