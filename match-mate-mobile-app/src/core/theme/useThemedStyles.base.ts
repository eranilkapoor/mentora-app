import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme } from './ThemeProvider';
import { Theme } from './types';
import { createBaseStyles } from './baseStyles';

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  styles?: (theme: Theme, base: ReturnType<typeof createBaseStyles>) => T
) => {
  const { theme } = useTheme();
  return useMemo(() => {
    const base = createBaseStyles(theme);

    if (!styles) return base;

    const custom = styles(theme, base);

    return {
      ...base,
      ...StyleSheet.create(custom),
    };
  }, [theme, styles]);
};
