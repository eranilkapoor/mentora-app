import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@/store/hooks';

import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import AppStack from './AppStack';
import { RootStackParamList } from './types';
import { getSharedScreenOptions } from './sharedScreenOptions';
import { useTheme } from '@/core/theme/ThemeProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator(): React.ReactElement {
  const { theme } = useTheme();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isOnboardingCompleted = useAppSelector(
    (s) => s.auth.user?.isOnboardingCompleted
  );

  const isLoggedIn = Boolean(accessToken);
  const hasOnboarded = Boolean(isOnboardingCompleted);

  return (
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      {!isLoggedIn ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <Stack.Screen name="App" component={AppStack} />
      )}
    </Stack.Navigator>
  );
}
