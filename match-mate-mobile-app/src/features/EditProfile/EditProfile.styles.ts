import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const editProfileStyles = (
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
    photoActionBtnDisabled: {
      backgroundColor: theme.colors.backgroundLight,
      opacity: 0.4,
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
    activityIndicator: {
      marginVertical: 16,
    },
    photoHint: {
      fontSize: 12,
      color: theme.colors.textMuted,
      paddingHorizontal: 16,
      paddingBottom: 12,
      lineHeight: 17,
    },
    videoIntroCard: {
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    videoIntroPreview: {
      width: '100%',
      aspectRatio: 16 / 9,
      backgroundColor: theme.colors.backgroundLight,
    },
    videoIntroThumbnail: {
      flex: 1,
      justifyContent: 'center',
    },
    videoIntroThumbnailImage: {
      resizeMode: 'cover',
    },
    videoIntroOverlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.overlayLight,
    },
    videoIntroPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: theme.colors.primaryLight,
    },
    videoIntroPlayButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    videoIntroPlaceholderText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: '800',
    },
    videoIntroMeta: {
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 10,
      gap: 5,
    },
    videoIntroTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    videoIntroTitle: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    videoIntroSubtitle: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
    },
    videoIntroBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 14,
      backgroundColor: theme.colors.accentLight,
    },
    videoIntroBadgeText: {
      color: theme.colors.accent,
      fontSize: 11,
      fontWeight: '800',
    },
    videoIntroActions: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    videoIntroActionBtn: {
      flex: 1,
      minHeight: 38,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.colors.backgroundLight,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    videoIntroActionBtnDanger: {
      backgroundColor: theme.colors.errorLight,
      borderColor: theme.colors.errorLight,
    },
    videoIntroActionBtnDisabled: {
      opacity: 0.55,
    },
    videoIntroActionText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '800',
    },
    videoIntroActionTextDanger: {
      color: theme.colors.danger,
    },
    lockedFeature: {
      minHeight: 82,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      opacity: 0.68,
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    lockedFeatureIcon: {
      width: 38,
      height: 38,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
    },
    lockedFeatureCopy: {
      flex: 1,
      minWidth: 0,
    },
    lockedFeatureTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    lockedFeatureText: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      color: theme.colors.textMuted,
    },

    // ── Form Fields ───────────────────────────────────────────────────────────

    row: {
      ...StyleSheet.flatten(base.row),
      gap: 10,
    },
    halfField: {
      flex: 1,
    },

    // ── Save Button ───────────────────────────────────────────────────────────
    footer: {
      height: StyleSheet.flatten(base.footer).height,
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
      color: theme.colors.textSecondary,
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
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      fontSize: 16,
      fontWeight: '700',
      minWidth: 24,
      textAlign: 'center',
      color: theme.colors.textPrimary,
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
      color: theme.colors.textMuted,
    },
    sublabel: {
      fontSize: 12,
      marginTop: 2,
      color: theme.colors.textMuted,
    },
  });
