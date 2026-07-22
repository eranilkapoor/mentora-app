import { StyleSheet } from 'react-native';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';

export const staticPageWebViewStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    webView: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundPage,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: theme.colors.backgroundPage,
    },
    errorIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
      backgroundColor: theme.colors.errorLight,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    errorMessage: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: 18,
      borderRadius: 8,
      paddingHorizontal: 18,
      paddingVertical: 11,
      backgroundColor: theme.colors.primary,
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.white,
    },
  });
