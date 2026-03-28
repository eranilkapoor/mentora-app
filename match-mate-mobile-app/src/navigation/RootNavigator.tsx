import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import Loader from '../components/Loader';

import { useAppDispatch, useAppSelector } from '../store';
import { restoreSession } from '../store/authActions';

const Stack = createNativeStackNavigator();

export default function RootNavigator(): React.ReactElement {
  const dispatch = useAppDispatch();

  const { token, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  // ✅ BLOCK UI until auth restored
  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token && user?.isProfileCompleted ? (
        <Stack.Screen name="App" component={AppStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
