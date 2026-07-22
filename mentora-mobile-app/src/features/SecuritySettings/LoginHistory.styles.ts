import { StyleSheet } from 'react-native';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';

export const loginHistoryStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    scrollContent: {
      ...StyleSheet.flatten(base.scrollContent),
      paddingBottom: 48,
    },
    overview: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    overviewTile: {
      ...StyleSheet.flatten(base.metricTile),
      flex: 1,
      minHeight: 82,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
    },
    overviewIcon: {
      ...StyleSheet.flatten(base.sectionIcon),
      width: 30,
      height: 30,
      borderRadius: 8,
    },
    overviewValue: {
      marginTop: 10,
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    overviewLabel: {
      marginTop: 2,
      fontSize: 11,
      color: theme.colors.textMuted,
    },
    row: {
      ...StyleSheet.flatten(base.listRow),
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 16,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    iconColumn: {
      width: 38,
      alignItems: 'center',
    },
    deviceIcon: {
      ...StyleSheet.flatten(base.optionIcon),
      width: 38,
      height: 38,
      borderRadius: 10,
    },
    timelineLine: {
      width: StyleSheet.hairlineWidth,
      flex: 1,
      marginTop: 8,
      backgroundColor: theme.colors.divider,
    },
    rowContent: {
      flex: 1,
    },
    activityRow: {
      ...StyleSheet.flatten(base.listRow),
      flexDirection: 'row',
      gap: 12,
    },
    activityIcon: {
      ...StyleSheet.flatten(base.iconTile),
    },
    activityIconWarning: {
      backgroundColor: theme.colors.warningLight,
    },
    activityMeta: {
      marginTop: 6,
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    meta: {
      marginTop: 4,
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
    detailGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    revokeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 10,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.errorLight,
      paddingVertical: 9,
    },
    revokeText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.error,
    },
    detailChip: {
      borderRadius: 8,
      backgroundColor: theme.colors.backgroundLight,
      paddingHorizontal: 10,
      paddingVertical: 7,
      minWidth: '47%',
      flexGrow: 1,
    },
    detailLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
    },
    detailValue: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textPrimary,
    },
    badge: {
      ...StyleSheet.flatten(base.badge),
    },
    badgeActive: {
      backgroundColor: theme.colors.successLight,
    },
    badgeText: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'capitalize',
    },
    badgeTextActive: {
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
