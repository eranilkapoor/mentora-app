import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAppSelector } from '../store/hooks';
import { navigationRef } from '../navigation/navigationRef';

import RootNavigator from '../navigation/RootNavigator';
import { ThemeProvider } from '../core/theme/ThemeProvider';
import Loader from '@/core/components/Loader';

interface Props {
  isHydrated: boolean;
}

export default function AppContent({ isHydrated }: Props) {
  const themeMode = useAppSelector((s) => s.settings.theme);
  const isDarkMode = themeMode === 'dark';

  if (!isHydrated) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <ThemeProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
