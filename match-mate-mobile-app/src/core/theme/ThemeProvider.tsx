import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useGetAccessibilitySettingsQuery } from '@/store/services/accessibilitySettingsApi.service';
import { useGetMediaSettingsQuery } from '@/store/services/mediaSettingsApi.service';
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  setAccessibilitySettings,
  setMediaSettings,
} from '@/store/slices/settings.slice';
import type { AccessibilitySettings } from '@/features/AccessibilitySettings/AccessibilitySettings.types';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';
import { Theme } from './types';
import {
  applyAccessibilityToTheme,
  FONT_SCALE_BY_SIZE,
} from './accessibilityTheme';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  accessibility: AccessibilitySettings;
  fontScale: number;
  reduceAnimations: boolean;
  screenReaderOptimized: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
  accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,
  fontScale: 1,
  reduceAnimations: false,
  screenReaderOptimized: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s) => s.settings.theme);
  const accessibility = useAppSelector(
    (s) => s.settings.accessibility ?? DEFAULT_ACCESSIBILITY_SETTINGS
  );
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const dispatch = useAppDispatch();
  const systemScheme = useColorScheme();
  const { data } = useGetAccessibilitySettingsQuery(undefined, {
    skip: !accessToken,
  });
  const { data: mediaData } = useGetMediaSettingsQuery(undefined, {
    skip: !accessToken,
  });

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const fontScale = FONT_SCALE_BY_SIZE[accessibility.fontSize] ?? 1;

  useEffect(() => {
    if (data?.accessibility) {
      dispatch(setAccessibilitySettings(data.accessibility));
    }
  }, [data?.accessibility, dispatch]);

  useEffect(() => {
    if (mediaData?.media) {
      dispatch(setMediaSettings(mediaData.media));
    }
  }, [dispatch, mediaData?.media]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: applyAccessibilityToTheme(
        isDark ? darkTheme : lightTheme,
        accessibility,
        isDark
      ),
      isDark,
      accessibility,
      fontScale,
      reduceAnimations: accessibility.reduceAnimations,
      screenReaderOptimized: accessibility.screenReaderOptimized,
    }),
    [accessibility, fontScale, isDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
