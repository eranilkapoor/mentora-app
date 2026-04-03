import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';
import { Theme } from './types';

const ThemeContext = createContext<{
  theme: Theme;
  isDark: boolean;
}>({
  theme: lightTheme,
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mode = useAppSelector((state) => state.settings.theme);
  const systemTheme = useColorScheme(); // 'light' | 'dark'

  // 🔥 Resolve final theme
  const isDark = mode === 'system' ? systemTheme === 'dark' : mode === 'dark';

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 🔥 Hook
export const useTheme = () => useContext(ThemeContext);
