import { Theme } from '@/core/theme/types';

import { StyleSheet } from 'react-native';

export const communicationSettingsStyles = (theme: Theme) =>
  StyleSheet.create({
    inputWrapper: {
      padding: 16,
    },

    inputLabel: {
      marginBottom: 8,
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },

    input: {
      minHeight: 100,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
  });
