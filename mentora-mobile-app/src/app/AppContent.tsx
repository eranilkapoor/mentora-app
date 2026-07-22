import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '@/navigation/navigationRef';
import RootNavigator from '@/navigation/RootNavigator';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import ThemedStatusBar from '@/core/components/ThemedStatusBar';
import { linkingConfig } from '@/navigation/linkingConfig';
import ToastHost from '@/core/components/feedback/ToastHost';
import ConfirmHost from '@/core/components/feedback/ConfirmHost';

export default function AppContent() {
  return (
    <ThemeProvider>
      <ThemedStatusBar />
      <NavigationContainer ref={navigationRef} linking={linkingConfig}>
        <RootNavigator />
      </NavigationContainer>
      <ConfirmHost />
      <ToastHost />
    </ThemeProvider>
  );
}
