import { Theme } from '@/core/theme/types';
// import { isWeb, windowWidth } from '@/core/utils/device';
import { StyleSheet } from 'react-native';
import { createBaseStyles } from '../theme/baseStyles';

export const commonStyles = (theme: Theme) => {
  const base = createBaseStyles(theme);

  return StyleSheet.create({
    screen: StyleSheet.flatten(base.screen),
    container: {
      ...StyleSheet.flatten(base.container),
      paddingHorizontal: 16,
    },
    card: {
      ...StyleSheet.flatten(base.cardBordered),
      borderRadius: 8,
      padding: 16,
    },

    title: {
      ...StyleSheet.flatten(base.h2),
      fontSize: 24,
      fontWeight: '700',
    },

    subtitle: {
      ...StyleSheet.flatten(base.body),
      color: theme.colors.textSecondary,
    },

    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
    },

    primaryButtonText: {
      color: theme.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
    },
  });
};
