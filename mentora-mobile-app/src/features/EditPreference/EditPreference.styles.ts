import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { Platform, StyleSheet } from 'react-native';

export const editPreferenceStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: StyleSheet.flatten(base.safe),
    flex: StyleSheet.flatten(base.container),
    scrollContent: {
      ...StyleSheet.flatten(base.scrollContent),
      paddingBottom: 48,
    },

    // ── Section Card ──────────────────────────────────────────────────────────
    sectionCard: {
      ...StyleSheet.flatten(base.sectionCard),
      borderRadius: 12,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: theme.colors.backgroundPage,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    sectionIconWrapper: {
      ...StyleSheet.flatten(base.sectionIcon),
      width: 26,
      height: 26,
      borderRadius: 7,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      flex: 1,
    },
    sectionBody: {
      padding: 16,
    },

    // ── Save Button ───────────────────────────────────────────────────────────
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      margin: 16,
      marginTop: Platform.OS === 'web' ? 4 : 14,
      backgroundColor: theme.colors.primary,
      paddingVertical: 13,
      borderRadius: 10,
    },
    aboutSaveButton: {
      marginTop: Platform.OS !== 'web' ? 74 : 4,
    },
    saveBtnDisabled: {
      opacity: 0.6,
    },
    saveBtnText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 15,
    },

    // ── Field ─────────────────────────────────────────────────────────────────
    field: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    fieldSublabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    subSectionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 8,
      marginBottom: 10,
    },

    // ── Range Input ───────────────────────────────────────────────────────────
    rangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 4,
    },
    rangeInput: {
      ...StyleSheet.flatten(base.input),
      flex: 1,
      borderRadius: 12,
      paddingVertical: 11,
      fontSize: 15,
      textAlign: 'center',
      minHeight: 52,
    },
    rangeSeparator: {
      fontSize: 18,
      color: theme.colors.textMuted,
      fontWeight: '300',
    },
    rangeUnit: {
      fontSize: 11,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: 4,
    },
    rangeHalfWrapper: {
      flex: 1,
      alignItems: 'stretch',
    },
    rangeHalfLabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginBottom: 4,
      textAlign: 'center',
    },

    // ── Multi Select Pills ────────────────────────────────────────────────────
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    pill: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 20,
      backgroundColor: theme.colors.inputBackground,
    },
    pillSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    pillText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    pillTextSelected: {
      color: theme.colors.primary,
      fontWeight: '700',
    },

    // ── Tag Input ─────────────────────────────────────────────────────────────
    tagInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    tagInput: {
      ...StyleSheet.flatten(base.input),
      flex: 1,
      borderRadius: 12,
      paddingVertical: 11,
      fontSize: 15,
      minHeight: 52,
    },
    tagAddBtn: {
      width: 42,
      height: 52,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tagList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    tagText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
    },

    // ── About Partner ─────────────────────────────────────────────────────────
    textArea: {
      ...StyleSheet.flatten(base.input),
      borderRadius: 12,
      paddingVertical: 12,
      fontSize: 15,
      minHeight: Platform.OS === 'web' ? 100 : 132,
      textAlignVertical: 'top',
      marginBottom: Platform.OS === 'web' ? 0 : 8,
    },
    charCount: {
      fontSize: 11,
      color: theme.colors.textMuted,
      textAlign: 'right',
      marginTop: 4,
      marginBottom: Platform.OS === 'web' ? 0 : 12,
    },

    // ── Info Banner ───────────────────────────────────────────────────────────
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
    },
    infoBannerText: {
      fontSize: 13,
      color: theme.colors.primary,
      flex: 1,
      lineHeight: 18,
    },

    // ── Weights Total ─────────────────────────────────────────────────────────
    weightsTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.divider,
      marginTop: 4,
    },
    weightsTotalLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    weightsTotalValue: {
      fontSize: 15,
      fontWeight: '900',
    },

    row: {
      ...StyleSheet.flatten(base.row),
      gap: 10,
    },
    halfField: {
      flex: 1,
    },
    footer: {
      height: 16,
    },
    disabled: {
      opacity: 0.4,
    },
  });
