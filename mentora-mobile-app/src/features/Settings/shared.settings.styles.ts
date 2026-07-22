import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const sharedSettingsStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    scrollContent: {
      ...StyleSheet.flatten(base.scrollContent),
      paddingBottom: 48,
    },
    footer: StyleSheet.flatten(base.footer),
    masterCard: {
      ...StyleSheet.flatten(base.sectionCard),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      marginBottom: 12,
    },
    masterLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingRight: 12,
    },
    masterTextWrapper: {
      flex: 1,
    },
    masterIconWrapper: {
      ...StyleSheet.flatten(base.sectionIcon),
      width: 32,
      height: 32,
      borderRadius: 8,
    },
    masterLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    masterSublabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 17,
    },
  });
