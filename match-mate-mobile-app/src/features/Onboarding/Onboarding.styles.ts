import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const onboardingStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: StyleSheet.flatten(base.container),
    content: {
      flexGrow: 1,
      paddingVertical: 24,
      paddingHorizontal: 20,
    },

    // ── Progress Bar ──────────────────────────────────────────────────────────
    progressBarWrapper: {
      height: 4,
      backgroundColor: theme.colors.border,
    },
    progressFill: {
      height: 4,
      backgroundColor: theme.colors.primary,
    },

    // ── Step Indicator ────────────────────────────────────────────────────────
    stepIndicatorContainer: {
      backgroundColor: theme.colors.surface,
      minHeight: 50,
      maxHeight: 70,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    stepIndicatorContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepIndicatorItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    stepDotActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    stepDotCompleted: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    stepDotLabel: {
      fontSize: 10,
      color: theme.colors.textMuted,
      marginLeft: 4,
      marginRight: 2,
    },
    stepDotLabelActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    stepDotLabelCompleted: {
      color: theme.colors.success,
    },
    stepConnector: {
      width: 60,
      height: 2,
      backgroundColor: theme.colors.border,
      marginHorizontal: 4,
    },
    stepConnectorCompleted: {
      backgroundColor: theme.colors.success,
    },

    // ── Typography ────────────────────────────────────────────────────────────
    stepTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 6,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textMuted,
      marginBottom: 20,
      lineHeight: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    error: {
      color: theme.colors.error,
      marginBottom: 10,
      marginTop: -6,
      fontSize: 12,
    },

    // ── Inputs ────────────────────────────────────────────────────────────────
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 13,
      marginBottom: 12,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
      minHeight: 52,
    },
    inputError: {
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.errorLight,
    },

    // ── Dropdown ──────────────────────────────────────────────────────────────
    dropdownTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownValueText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
    },
    dropdownPlaceholder: {
      color: theme.colors.textMuted,
      fontSize: 15,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      maxHeight: 220,
      shadowColor: theme.colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    dropdownItemActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    dropdownItemText: {
      fontSize: 15,
      color: theme.colors.textPrimary,
    },
    dropdownItemTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // ── Chips ─────────────────────────────────────────────────────────────────
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
      marginTop: 4,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.inputBackground,
      gap: 5,
    },
    chipActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    chipTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    chipRemove: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipMore: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      gap: 4,
    },
    chipMoreText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    chipShowLess: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      gap: 4,
    },

    // ── Layout ────────────────────────────────────────────────────────────────
    row: {
      ...StyleSheet.flatten(base.row),
      gap: 12,
    },
    halfField: {
      flex: 1,
    },

    // ── Buttons ───────────────────────────────────────────────────────────────
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
      marginBottom: 20,
      paddingBottom: 20,
    },
    primaryButton: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 16,
    },
    secondaryButton: {
      flex: 1,
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 16,
    },
    disabledButton: {
      opacity: 0.6,
    },

    // ── Photos ────────────────────────────────────────────────────────────────
    photoRow: {
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 8,
      paddingHorizontal: 2,
    },
    photoWrapper: {
      width: 110,
      height: 140,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    photo: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
    },
    primaryBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    primaryBadgeText: {
      color: theme.colors.white,
      fontSize: 10,
      fontWeight: '700',
    },
    photoActions: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      flexDirection: 'row',
      gap: 6,
    },
    photoActionBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
    },
    photoActionBtnDanger: {
      backgroundColor: theme.colors.errorLight,
    },
    addPhotoBtn: {
      width: 110,
      height: 140,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.colors.backgroundLight,
    },
    addPhotoText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },
    photoHint: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 10,
      marginBottom: 4,
      lineHeight: 18,
    },
    photoEmptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      gap: 8,
    },
    photoEmptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    photoEmptySubtitle: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },

    // ── Date Picker ───────────────────────────────────────────────────────────
  });
