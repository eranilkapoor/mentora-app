import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const themeStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
    },
    row: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
    },
    activeRow: {
      borderColor: theme.colors.primary,
    },
    label: { fontSize: 16 },
  });
