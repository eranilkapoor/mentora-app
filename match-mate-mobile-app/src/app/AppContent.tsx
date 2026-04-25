import React from 'react';
import Toast from 'react-native-toast-message';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '@/navigation/navigationRef';
import RootNavigator from '@/navigation/RootNavigator';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import ThemedStatusBar from '@/core/components/ThemedStatusBar';
import { linkingConfig } from '@/navigation/linkingConfig';

export default function AppContent() {
  return (
    <ThemeProvider>
      <ThemedStatusBar />
      <NavigationContainer ref={navigationRef} linking={linkingConfig}>
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </ThemeProvider>
  );
}
