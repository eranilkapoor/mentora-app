import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';
import { Theme } from './types';

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  styles: (theme: Theme) => T
) => {
  const { theme } = useTheme();
  return StyleSheet.create(styles(theme));
};
