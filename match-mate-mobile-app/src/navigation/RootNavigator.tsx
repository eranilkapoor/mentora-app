import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store/hooks';
import { RootStackParamList } from './types';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import Loader from '@/core/components/Loader';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator(): React.ReactElement {
  const token = useAppSelector((state) => state.auth?.token);
  const user = useAppSelector((state) => state.auth?.user);
  const isHydrated = useAppSelector((state) => state.auth?.isHydrated ?? false);

  const isLoggedIn = Boolean(token);
  const isProfileComplete = Boolean(user?.isProfileCompleted);

  if (!isHydrated) {
    return <Loader />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isLoggedIn && isProfileComplete ? (
        <Stack.Screen name="App" component={AppStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
