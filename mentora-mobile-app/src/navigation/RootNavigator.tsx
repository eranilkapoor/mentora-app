import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@/store/hooks';

import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import AppStack from './AppStack';
import { RootStackParamList } from './types';
import { getSharedScreenOptions } from './sharedScreenOptions';
import { useTheme } from '@/core/theme/ThemeProvider';
import { getRootEntryRoute } from './rootRoute.utils';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator(): React.ReactElement {
  const { theme, reduceAnimations } = useTheme();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isOnboardingCompleted = useAppSelector(
    (s) => s.auth.user?.isOnboardingCompleted
  );
  const onboardingCompletionPending = useAppSelector(
    (s) => s.auth.onboardingCompletionPending
  );
  const roles = useAppSelector((s) => s.auth.user?.roles);
  const entryRoute = getRootEntryRoute(
    accessToken,
    isOnboardingCompleted,
    onboardingCompletionPending,
    roles
  );

  return (
    <Stack.Navigator
      screenOptions={getSharedScreenOptions(theme, reduceAnimations)}
    >
      {entryRoute === 'Auth' ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : entryRoute === 'Onboarding' ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <Stack.Screen name="App" component={AppStack} />
      )}
    </Stack.Navigator>
  );
}
