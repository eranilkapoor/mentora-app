import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';
import { Theme } from './types';
import { createBaseStyles } from './baseStyles';

/**
 * Pass a STABLE styles factory (defined at module scope, not inline).
 * Defining the factory inside a component creates a new reference every
 * render and will cause infinite re-renders.
 *
 * CORRECT:
 *   const myStyles = (theme: Theme) => ({ ... });
 *   const styles = useThemedStyles(myStyles);
 *
 * WRONG:
 *   const styles = useThemedStyles((theme) => ({ ... })); // new fn every render
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme, base: ReturnType<typeof createBaseStyles>) => T
): T & ReturnType<typeof createBaseStyles> {
  const { theme } = useTheme();

  return useMemo(() => {
    const base = createBaseStyles(theme);
    const custom = StyleSheet.create(factory(theme, base));
    // Custom keys override base keys of the same name
    return { ...base, ...custom } as T & ReturnType<typeof createBaseStyles>;

    // factory is intentionally excluded from deps — it must be stable
    // (module-level constant). Including it would cause infinite re-renders
    // when defined inline. Consumers are responsible for stability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}
