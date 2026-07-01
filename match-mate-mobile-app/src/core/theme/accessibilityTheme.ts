import type { AccessibilitySettings } from '@/features/AccessibilitySettings/AccessibilitySettings.types';
import type { ColorPalette, Theme } from './types';

export const FONT_SCALE_BY_SIZE: Record<
  AccessibilitySettings['fontSize'],
  number
> = {
  small: 0.94,
  medium: 1,
  large: 1.12,
  extra_large: 1.22,
};

const toHighContrastColors = (
  colors: ColorPalette,
  isDark: boolean
): ColorPalette => ({
  ...colors,
  background: isDark ? '#000000' : '#FFFFFF',
  backgroundPage: isDark ? '#000000' : '#FFFFFF',
  backgroundLight: isDark ? '#111111' : '#FFF4F7',
  surface: isDark ? '#0B0B0B' : '#FFFFFF',
  surfaceElevated: isDark ? '#111111' : '#FFFFFF',
  textPrimary: isDark ? '#FFFFFF' : '#111111',
  textSecondary: isDark ? '#F3F4F6' : '#242424',
  textMuted: isDark ? '#E5E7EB' : '#4B5563',
  textBody: isDark ? '#FFFFFF' : '#1F2937',
  border: isDark ? '#D1D5DB' : '#6B7280',
  divider: isDark ? '#6B7280' : '#9CA3AF',
  borderStrong: isDark ? '#FFFFFF' : '#374151',
  inputBorder: isDark ? '#FFFFFF' : '#374151',
  inputPlaceholder: isDark ? '#D1D5DB' : '#4B5563',
});

export const applyAccessibilityToTheme = (
  baseTheme: Theme,
  accessibility: AccessibilitySettings,
  isDark: boolean
): Theme => {
  const fontScale = FONT_SCALE_BY_SIZE[accessibility.fontSize] ?? 1;
  const boldWeight = accessibility.boldText ? '700' : undefined;
  const scaleText = <T extends { fontSize: number; fontWeight?: string }>(
    value: T
  ): T => ({
    ...value,
    fontSize: Math.round(value.fontSize * fontScale),
    fontWeight: boldWeight ?? value.fontWeight,
  });

  return {
    ...baseTheme,
    colors: accessibility.highContrastMode
      ? toHighContrastColors(baseTheme.colors, isDark)
      : baseTheme.colors,
    typography: {
      ...baseTheme.typography,
      h1: scaleText(baseTheme.typography.h1),
      h2: scaleText(baseTheme.typography.h2),
      h3: scaleText(baseTheme.typography.h3),
      body: scaleText(baseTheme.typography.body),
      caption: scaleText(baseTheme.typography.caption),
      button: scaleText(baseTheme.typography.button),
    },
    shadows: accessibility.reduceAnimations
      ? {
          sm: { ...baseTheme.shadows.sm, elevation: 0, shadowOpacity: 0 },
          md: { ...baseTheme.shadows.md, elevation: 0, shadowOpacity: 0 },
          lg: { ...baseTheme.shadows.lg, elevation: 0, shadowOpacity: 0 },
        }
      : baseTheme.shadows,
  };
};
