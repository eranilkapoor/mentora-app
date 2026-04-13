import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store/hooks';

import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import AppStack from './AppStack';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator(): React.ReactElement {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  const isLoggedIn = Boolean(token);
  const isProfileComplete = Boolean(user?.isProfileCompleted);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!isLoggedIn ? (
        // ❌ Not logged in → Auth
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !isProfileComplete ? (
        // ⚠️ Logged in but onboarding pending
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        // ✅ Fully ready
        <Stack.Screen name="App" component={AppStack} />
      )}
    </Stack.Navigator>
  );
}
