import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const languageStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    scrollContent: StyleSheet.flatten(base.scrollContentRelaxed),

    // ─── Header Card ──────────────────────────────────────────────────────
    headerCard: {
      ...StyleSheet.flatten(base.headerCard),
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
      ...StyleSheet.flatten(base.sectionCard),
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
    },
    sectionHeader: {
      ...StyleSheet.flatten(base.sectionHeader),
    },
    sectionIconWrapper: {
      ...StyleSheet.flatten(base.sectionIcon),
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
      ...StyleSheet.flatten(base.optionRow),
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
      ...StyleSheet.flatten(base.optionIcon),
    },
    optionIconWrapperActive: {
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.primaryBorder,
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
    optionNativeName: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 1,
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

    // ─── Restart Notice ───────────────────────────────────────────────────
    noticeCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    },
    noticeText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.primary,
      lineHeight: 18,
    },
  });
