import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const sharedSettingsStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 48,
    },
    footer: { height: 24 },
  });
