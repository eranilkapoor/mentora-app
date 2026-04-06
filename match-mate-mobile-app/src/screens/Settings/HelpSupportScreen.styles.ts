import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const helpSupportStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textBody,
      marginBottom: 16,
      lineHeight: 20,
    },
    card: {
      backgroundColor: theme.colors.inputBackground,
      padding: 16,
      borderRadius: 10,
      marginBottom: 24,
      elevation: 1,
      boxShadow: `0px 1px 4px rgba(0, 0, 0, 0.04)`,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 12,
      color: theme.colors.textPrimary,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
    },
    contactIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    contactRowText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    faqTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      color: theme.colors.textPrimary,
    },
    faqList: {
      borderRadius: 10,
      backgroundColor: theme.colors.white,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    faqContainer: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    faqQuestion: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      paddingRight: 12,
    },
    faqAnswer: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 21,
      color: theme.colors.textBody,
    },
    footer: {
      height: 24,
    },
  });
