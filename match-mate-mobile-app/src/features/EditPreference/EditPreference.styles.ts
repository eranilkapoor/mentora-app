import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const editPreferenceStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.backgroundPage },
    flex: { flex: 1 },
    scrollContent: {
      padding: 16,
      paddingBottom: 48,
    },

    // ── Section Card ──────────────────────────────────────────────────────────
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
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
      width: 26,
      height: 26,
      borderRadius: 7,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
      marginTop: 4,
      backgroundColor: theme.colors.primary,
      paddingVertical: 13,
      borderRadius: 10,
    },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 15,
    },

    // ── Field ─────────────────────────────────────────────────────────────────
    field: { marginBottom: 14 },
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
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
      textAlign: 'center',
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
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
    tagAddBtn: {
      width: 42,
      height: 42,
      borderRadius: 10,
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

    // ── Toggle Row ────────────────────────────────────────────────────────────
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      minHeight: 44,
    },
    toggleLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      flex: 1,
    },
    toggleSublabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 2,
    },

    // ── Weight Slider ─────────────────────────────────────────────────────────
    weightRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    weightLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      flex: 1,
    },
    weightValue: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.primary,
      minWidth: 32,
      textAlign: 'right',
    },
    weightTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.backgroundLight,
      marginTop: 6,
      marginBottom: 14,
      overflow: 'hidden',
    },
    weightFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    weightBtnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    weightBtn: {
      width: 28,
      height: 28,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ── Score Stepper ─────────────────────────────────────────────────────────
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    scoreLabelBlock: { flex: 1 },
    scoreLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    scoreSublabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    scoreControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    scoreBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      minWidth: 36,
      textAlign: 'center',
    },

    // ── About Partner ─────────────────────────────────────────────────────────
    textArea: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    charCount: {
      fontSize: 11,
      color: theme.colors.textMuted,
      textAlign: 'right',
      marginTop: 4,
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

    row: { flexDirection: 'row', gap: 10 },
    halfField: { flex: 1 },
    footer: { height: 16 },
  });
