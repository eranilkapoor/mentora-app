import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const changePasswordStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    scrollContent: {
      ...StyleSheet.flatten(base.scrollContent),
      paddingBottom: 48,
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 10,
      padding: 14,
      marginBottom: 20,
    },
    infoBannerText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
      lineHeight: 18,
    },
    cardBody: {
      padding: 16,
    },
    fieldWrapper: {
      marginBottom: 4,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    inputContainer: {
      ...StyleSheet.flatten(base.input),
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      paddingHorizontal: 12,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      paddingVertical: 13,
      fontSize: 15,
      color: theme.colors.textPrimary,
    },
    eyeButton: {
      padding: 6,
    },
    inputError: {
      ...StyleSheet.flatten(base.inputError),
    },
    inputDisabled: {
      opacity: 0.5,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 5,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: 16,
    },
    strengthWrapper: {
      marginTop: 10,
      marginBottom: 4,
    },
    strengthBarRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 6,
    },
    strengthSegment: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
    },
    rulesContainer: {
      gap: 5,
    },
    ruleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    ruleText: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    ruleTextPassed: {
      color: theme.colors.success,
    },
    matchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    matchText: {
      fontSize: 12,
      fontWeight: '500',
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingVertical: 15,
      borderRadius: 12,
      marginTop: 20,
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 16,
    },
    disabledButton: {
      opacity: 0.6,
    },
    resetButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    resetButtonText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: '500',
    },
  });
