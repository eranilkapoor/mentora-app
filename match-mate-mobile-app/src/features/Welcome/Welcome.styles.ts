import { StyleSheet } from 'react-native';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';

export const welcomeStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 28,
      backgroundColor: theme.colors.backgroundPage,
    },
    panel: {
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      paddingHorizontal: 2,
      paddingVertical: 0,
    },
    compactPanel: {
      paddingHorizontal: 0,
    },
    logoWrap: {
      width: 96,
      height: 96,
      borderRadius: 24,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
      ...theme.shadows.md,
    },
    logo: {
      width: 74,
      height: 74,
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0,
      marginBottom: 8,
      textAlign: 'center',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '900',
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
      textAlign: 'center',
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.errorLight,
      borderColor: theme.colors.error,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
    },
    errorText: {
      flex: 1,
      color: theme.colors.error,
      fontSize: 13,
      fontWeight: '600',
    },
    primaryButton: {
      minHeight: 52,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      marginBottom: 10,
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '800',
    },
    secondaryButton: {
      minHeight: 50,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '800',
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginVertical: 16,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
    },
    dividerText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    socialList: {
      gap: 10,
    },
    legalText: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 16,
    },
    legalLink: {
      color: theme.colors.link,
      fontWeight: '800',
    },
  });
