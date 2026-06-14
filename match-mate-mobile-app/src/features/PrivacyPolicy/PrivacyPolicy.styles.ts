import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const privacyPolicyStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    scrollContent: {
      ...StyleSheet.flatten(base.scrollContent),
      paddingBottom: 40,
    },
    card: {
      backgroundColor: theme.colors.surface,
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
    legalIntro: {
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    legalRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    legalRowLast: {
      borderBottomWidth: 0,
    },
    legalNumber: {
      width: 26,
      height: 26,
      borderRadius: 13,
      overflow: 'hidden',
      textAlign: 'center',
      lineHeight: 26,
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    legalContent: {
      flex: 1,
    },
    legalTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    legalBody: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.textMuted,
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
    footer: StyleSheet.flatten(base.footer),
  });
