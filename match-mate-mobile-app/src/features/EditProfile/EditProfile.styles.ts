import { Theme } from '@/core/theme/types';
import { Platform, StyleSheet } from 'react-native';

export const editProfileStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 48,
    },

    // ── Completion ────────────────────────────────────────────────────────────
    completionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...(Platform.OS === 'ios' || Platform.OS === 'android'
        ? {
            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)',
          }
        : {
            shadowColor: theme.colors.black,
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }),
    },
    completionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    completionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    completionSubtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      maxWidth: 220,
    },
    completionPercent: {
      fontSize: 24,
      fontWeight: '900',
    },
    progressBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.backgroundLight,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 6,
      borderRadius: 3,
    },

    // ── Section Card ──────────────────────────────────────────────────────────
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      ...(Platform.OS === 'ios' || Platform.OS === 'android'
        ? {
            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)',
          }
        : {
            shadowColor: theme.colors.black,
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.04,
            shadowRadius: 4,
          }),
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
      backgroundColor: theme.colors.surface,
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

    // ── Photos ────────────────────────────────────────────────────────────────
    photoRow: {
      gap: 10,
      paddingHorizontal: 2,
      paddingVertical: 4,
    },
    photoWrapper: {
      position: 'relative',
      marginRight: 4,
    },
    photo: {
      width: 100,
      height: 125,
      borderRadius: 10,
    },
    primaryBadge: {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      paddingVertical: 2,
      alignItems: 'center',
    },
    primaryBadgeText: {
      color: theme.colors.white,
      fontSize: 10,
      fontWeight: '700',
    },
    photoActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
      gap: 6,
    },
    photoActionBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: theme.colors.backgroundLight,
    },
    photoActionBtnDanger: {
      backgroundColor: theme.colors.errorLight,
    },
    addPhotoBtn: {
      width: 100,
      height: 125,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.colors.inputBackground,
    },
    addPhotoText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },
    photoHint: {
      fontSize: 12,
      color: theme.colors.textMuted,
      paddingHorizontal: 16,
      paddingBottom: 12,
      lineHeight: 17,
    },

    // ── Form Fields ───────────────────────────────────────────────────────────
    field: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
    multilineInput: {
      minHeight: 90,
      paddingTop: 12,
    },
    inputDisabled: {
      opacity: 0.5,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    halfField: {
      flex: 1,
    },

    // ── Pills ─────────────────────────────────────────────────────────────────
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
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

    // ── Time of Birth ─────────────────────────────────────────────────────────
    timePickerLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    timePickerRow: {
      flexDirection: 'row',
      gap: 8,
    },
    timePickerColumn: {
      flex: 1,
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
    saveBtnDisabled: {
      opacity: 0.6,
    },
    saveBtnText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 15,
    },
    footer: {
      height: 16,
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
    rowNumberSteper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    btn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      fontSize: 16,
      fontWeight: '700',
      minWidth: 24,
      textAlign: 'center',
    },
    disabled: {
      opacity: 0.4,
    },
    subheading: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
      marginTop: 4,
    },
    rowToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      minHeight: 44,
    },
    sublabel: {
      fontSize: 12,
      marginTop: 2,
    },
  });
