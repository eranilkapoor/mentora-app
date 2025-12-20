import React from 'react';
import { useAppSelector } from '../store';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <AppNavigator /> : <AuthNavigator />;
}
