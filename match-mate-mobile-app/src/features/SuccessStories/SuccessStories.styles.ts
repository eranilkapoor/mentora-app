import { StyleSheet } from 'react-native';
import type { Theme } from '@/core/theme/types';

export const successStoriesStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16, paddingBottom: 40, gap: 16 },
    intro: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      borderRadius: 8,
      gap: 6,
    },
    title: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
    },
    form: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      borderRadius: 8,
      gap: 10,
    },
    label: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    input: {
      minHeight: 46,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 6,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.background,
    },
    storyInput: { minHeight: 140, textAlignVertical: 'top' },
    consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    consentText: {
      flex: 1,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    button: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    buttonDisabled: { opacity: 0.45 },
    buttonText: {
      fontSize: theme.typography.button.fontSize,
      fontWeight: '600',
      color: theme.colors.white,
    },
    historyTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    storyCard: {
      padding: 14,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      borderRadius: 8,
      gap: 6,
    },
    storyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    storyTitle: {
      flex: 1,
      fontSize: theme.typography.body.fontSize,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    status: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.primary,
    },
    storyMeta: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
    },
    reason: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.error,
    },
    empty: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textMuted,
    },
  });
