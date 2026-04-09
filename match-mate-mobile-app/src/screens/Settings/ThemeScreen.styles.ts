import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const themeStyles = (theme: Theme) =>
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
      marginBottom: 20,
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
      lineHeight: 18,
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

    // ─── Option Row ───────────────────────────────────────────────────────
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    optionRowLast: {
      borderBottomWidth: 0,
    },
    optionRowActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    optionIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionIconWrapperActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    optionLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    optionLabelActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    optionDescription: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },

    // ─── Check Badge ──────────────────────────────────────────────────────
    checkBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBadgeEmpty: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },

    // ─── Info Card ────────────────────────────────────────────────────────
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.primary,
      lineHeight: 18,
    },
  });