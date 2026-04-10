import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const helpSupportStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 40,
    },

    // ─── Header Card ──────────────────────────────────────────────────────
    headerCard: {
      backgroundColor: theme.colors.white,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 1,
    },
    headerIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 13,
      color: theme.colors.textMuted,
      lineHeight: 19,
    },

    // ─── Section Card ─────────────────────────────────────────────────────
    sectionCard: {
      backgroundColor: theme.colors.white,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 1,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    sectionIconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // ─── Contact Row ──────────────────────────────────────────────────────
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
      gap: 12,
    },
    contactRowLast: {
      borderBottomWidth: 0,
    },
    contactIconWrapper: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactTextWrapper: {
      flex: 1,
    },
    contactLabel: {
      fontSize: 13,
      color: theme.colors.textMuted,
      marginBottom: 1,
    },
    contactValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },

    // ─── FAQ ──────────────────────────────────────────────────────────────
    faqContainer: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
      overflow: 'hidden',
    },
    faqContainerLast: {
      borderBottomWidth: 0,
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 15,
      gap: 12,
    },
    faqHeaderActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    faqIconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    faqIconWrapperActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    faqQuestion: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      lineHeight: 20,
    },
    faqQuestionActive: {
      color: theme.colors.primary,
    },
    faqAnswer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 4,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textBody,
    },

    // ─── Footer ───────────────────────────────────────────────────────────
    footer: {
      height: 24,
    },
  });
