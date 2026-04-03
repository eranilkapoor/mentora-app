import { Theme } from './types';
import { StyleSheet } from 'react-native';

export const createBaseStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    textPrimary: {
      color: theme.colors.textPrimary,
    },
  });
