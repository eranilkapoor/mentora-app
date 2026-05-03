import { StyleSheet } from 'react-native';
import { Theme } from '../theme/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    content: {
      alignItems: 'center',
      maxWidth: 320,
    },
    title: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight as '600',
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.medium,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    debugText: {
      fontSize: 12,
      color: theme.colors.error,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    button: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      minWidth: 140,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: theme.typography.button.fontSize,
      fontWeight: theme.typography.button.fontWeight as '600',
      color: theme.colors.white,
    },
  });