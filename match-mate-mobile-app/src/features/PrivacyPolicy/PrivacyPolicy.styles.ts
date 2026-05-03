import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const privacyPolicyStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: 8,
      padding: 16,
      overflow: 'hidden',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme.colors.textPrimary,
    },
    updateText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginBottom: 16,
    },
    policySection: {
      marginTop: 4,
    },
    heading: {
      fontSize: 18,
      fontWeight: '700',
      marginTop: 20,
      marginBottom: 8,
      color: theme.colors.textPrimary,
    },
    subHeading: {
      fontSize: 15,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 6,
      color: theme.colors.textSecondary,
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textBody,
      marginBottom: 8,
    },
    bulletRow: {
      flexDirection: 'row',
      marginBottom: 5,
      paddingRight: 8,
    },
    bulletDot: {
      fontSize: 14,
      color: theme.colors.primary,
      marginRight: 8,
      lineHeight: 22,
    },
    bulletText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textBody,
    },
    footer: {
      height: 24,
    },
  });
