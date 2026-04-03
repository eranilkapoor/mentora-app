import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import AppStack from './AppStack';

import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator();

export default function RootNavigator(): React.ReactElement {
  const token = useAppSelector((state) => state.auth?.token);
  const user = useAppSelector((state) => state.auth?.user);

  const isLoggedIn = Boolean(token);
  const isProfileComplete = Boolean(user?.isProfileCompleted);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn && isProfileComplete ? (
        <Stack.Screen name="App" component={AppStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
