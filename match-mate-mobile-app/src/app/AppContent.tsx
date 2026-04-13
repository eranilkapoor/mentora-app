import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAppSelector } from '../store/hooks';
import { navigationRef } from '../navigation/navigationRef';

import RootNavigator from '../navigation/RootNavigator';
import { ThemeProvider } from '../core/theme/ThemeProvider';
import i18n from '../i18n';

interface Props {
  isHydrated: boolean;
}

export default function AppContent({ isHydrated }: Props) {
  const themeMode = useAppSelector((s) => s.settings.theme);
  const lang = useAppSelector((s) => s.settings.language);

  const isDarkMode = themeMode === 'dark';

  // 🌍 Language sync
  useEffect(() => {
    if (!isHydrated) return;

    i18n.changeLanguage(lang).catch((err) => {
      console.error('i18n error:', err);
    });
  }, [lang, isHydrated]);

  return (
    <ThemeProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
