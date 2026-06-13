import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const supportTicketsStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    scrollContent: StyleSheet.flatten(base.scrollContentRelaxed),
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.textMuted,
    },
    formCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: 7,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      minHeight: 44,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.backgroundPage,
      fontSize: 14,
      marginBottom: 12,
    },
    textArea: {
      minHeight: 104,
      textAlignVertical: 'top',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    chip: {
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      paddingHorizontal: 11,
      paddingVertical: 7,
      backgroundColor: theme.colors.backgroundPage,
    },
    chipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    chipTextActive: {
      color: theme.colors.primary,
    },
    primaryButton: {
      minHeight: 46,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    primaryButtonDisabled: {
      opacity: 0.55,
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: '700',
    },
    ticketRow: {
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
    },
    ticketRowLast: {
      borderBottomWidth: 0,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    rowTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    rowMeta: {
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 4,
      backgroundColor: theme.colors.primaryLight,
    },
    badgeText: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'capitalize',
    },
    emptyText: {
      padding: 18,
      color: theme.colors.textMuted,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
    },
    messageCard: {
      borderRadius: 12,
      padding: 13,
      marginBottom: 10,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    messageCardUser: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    messageAuthor: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: 5,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    messageBody: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      lineHeight: 21,
    },
    messageTime: {
      marginTop: 8,
      fontSize: 11,
      color: theme.colors.textMuted,
    },
    closeButton: {
      minHeight: 42,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    closeButtonText: {
      color: theme.colors.textSecondary,
      fontWeight: '700',
      fontSize: 13,
    },
  });
