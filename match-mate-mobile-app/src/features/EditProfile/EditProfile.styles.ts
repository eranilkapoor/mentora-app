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

    row: {
      flexDirection: 'row',
      gap: 10,
    },
    halfField: {
      flex: 1,
    },

    // ── Save Button ───────────────────────────────────────────────────────────
    footer: {
      height: 10,
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
    sublabel: {
      fontSize: 12,
      marginTop: 2,
    },
  });
