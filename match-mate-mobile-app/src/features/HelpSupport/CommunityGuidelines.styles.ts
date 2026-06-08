import { StyleSheet } from 'react-native';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';

export const communityGuidelinesStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    scrollContent: {
      ...StyleSheet.flatten(base.scrollContent),
      paddingBottom: 48,
    },
    guidelineRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    guidelineRowLast: {
      borderBottomWidth: 0,
    },
    guidelineNumber: {
      width: 26,
      height: 26,
      borderRadius: 13,
      overflow: 'hidden',
      textAlign: 'center',
      lineHeight: 26,
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    guidelineContent: {
      flex: 1,
    },
    guidelineTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    guidelineBody: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.textMuted,
    },
    footer: StyleSheet.flatten(base.footer),
  });
