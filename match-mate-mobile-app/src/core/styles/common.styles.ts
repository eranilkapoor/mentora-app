import { Theme } from '@/core/theme/types';
// import { isWeb, windowWidth } from '@/core/utils/device';
import { StyleSheet } from 'react-native';

export const commonStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },

    subtitle: {
      fontSize: 15,
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
