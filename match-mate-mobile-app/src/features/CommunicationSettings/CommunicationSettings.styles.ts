import { Theme } from '@/core/theme/types';

import { StyleSheet } from 'react-native';

export const communicationSettingsStyles = (
  theme: Theme
) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },

    scrollContent: {
      padding: 16,
      paddingBottom: 48,
    },

    heroCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 16,
      padding: 16,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
    },

    heroIconWrapper: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.white,
      marginRight: 14,
    },

    heroContent: {
      flex: 1,
    },

    heroTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },

    heroSubtitle: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textSecondary,
    },

    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',

      elevation: 1,

      shadowColor: theme.colors.black,
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 1,
      },
    },

    cardHeader: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.backgroundPage,
    },

    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },

    sectionSubtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textMuted,
    },

    rowDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
      marginLeft: 16,
    },

    selectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 15,
    },

    selectLeft: {
      flex: 1,
      paddingRight: 12,
    },

    selectLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },

    selectDescription: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textMuted,
    },

    selectRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    selectValue: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.primary,
      textTransform: 'capitalize',
    },

    inputWrapper: {
      padding: 16,
    },

    inputLabel: {
      marginBottom: 8,
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },

    input: {
      minHeight: 100,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
      color: theme.colors.textPrimary,
      backgroundColor:
        theme.colors.inputBackground,
    },

    footer: {
      height: 24,
    },

    pressed: {
      opacity: 0.7,
    },
  });