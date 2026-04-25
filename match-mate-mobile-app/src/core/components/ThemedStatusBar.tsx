import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider'; // adjust to your hook

export default function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />;
}
