import { StyleSheet } from 'react-native';
import { createBaseStyles } from '@/core/theme/baseStyles';
import type { Theme } from '@/core/theme/types';

export const successStoriesStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    content: StyleSheet.flatten(base.scrollContentRelaxed),
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
    storyInput: { minHeight: 140, textAlignVertical: 'top' },
    consentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 14,
    },
    consentCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      backgroundColor: theme.colors.backgroundPage,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    consentCheckboxActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    consentText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textSecondary,
    },
    primaryButton: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
    },
    primaryButtonDisabled: { opacity: 0.55 },
    primaryButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: '700',
    },
    storyRow: {
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
    },
    storyRowLast: {
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
    badge: {
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 4,
      backgroundColor: theme.colors.primaryLight,
    },
    badgeSuccess: {
      backgroundColor: theme.colors.successLight,
    },
    badgeWarning: {
      backgroundColor: theme.colors.warningLight,
    },
    badgeMuted: {
      backgroundColor: theme.colors.backgroundPage,
    },
    badgeText: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'capitalize',
    },
    badgeTextSuccess: {
      color: theme.colors.success,
    },
    badgeTextWarning: {
      color: theme.colors.warning,
    },
    badgeTextMuted: {
      color: theme.colors.textSecondary,
    },
    rowMeta: {
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
    statusNoteText: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textSecondary,
    },
    rejectionNoteText: {
      color: theme.colors.error,
    },
    emptyState: {
      padding: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
      marginBottom: 10,
    },
    emptyTitleText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
