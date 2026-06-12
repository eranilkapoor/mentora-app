import { StyleSheet, TextStyle } from 'react-native';
import { Theme } from './types';

// React Native's fontWeight only accepts these literal values
type FontWeight = TextStyle['fontWeight'];

/**
 * Base styles available to every screen via useThemedStyles.
 * These cover the most common layout and text patterns so screens
 * don't redefine them each time.
 */
export const createBaseStyles = (theme: Theme) =>
  StyleSheet.create({
    // ─── Layout ───────────────────────────────────────────────────────────
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    screen: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
      paddingHorizontal: theme.layout.screenPadding,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },
    scrollContentCompact: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 28,
    },
    scrollContentRelaxed: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 48,
    },
    section: {
      marginBottom: theme.layout.sectionSpacing,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      height: 24,
    },
    loadingWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 24,
    },
    loadingText: {
      fontSize: 13,
      color: theme.colors.textMuted,
      fontFamily: theme.typography.fontFamily.regular,
    },

    // ─── Cards ────────────────────────────────────────────────────────────
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.layout.cardPadding,
      ...theme.shadows.sm,
    },
    cardBordered: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.layout.cardPadding,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    // ─── Typography ───────────────────────────────────────────────────────
    // Shared card variants used by settings, notifications, and legal screens.
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginBottom: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    contentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      ...theme.shadows.sm,
    },
    iconTile: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    // Text primitives
    h1: {
      fontSize: theme.typography.h1.fontSize,
      fontWeight: theme.typography.h1.fontWeight as FontWeight,
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.bold,
    },
    h2: {
      fontSize: theme.typography.h2.fontSize,
      fontWeight: theme.typography.h2.fontWeight as FontWeight,
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.bold,
    },
    h3: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight as FontWeight,
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.medium,
    },
    body: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textBody,
      fontFamily: theme.typography.fontFamily.regular,
    },
    caption: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      fontFamily: theme.typography.fontFamily.regular,
    },

    // ─── Inputs ───────────────────────────────────────────────────────────
    input: {
      height: theme.components.input.height,
      borderRadius: theme.components.input.borderRadius,
      borderWidth: theme.components.input.borderWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
      paddingHorizontal: theme.spacing.md,
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.regular,
    },

    // ─── Divider ──────────────────────────────────────────────────────────
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.sm,
    },
  });
