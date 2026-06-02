import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { getSharedScreenOptions } from './sharedScreenOptions';

import LoginScreen from '@/features/Login/Login.screen';
import RegisterScreen from '@/features/Register/Register.screen';
import ForgotPasswordScreen from '@/features/ForgotPassword/ForgotPassword.screen';
import ResetPasswordScreen from '@/features/ResetPassword/ResetPassword.screen';
import MagicLoginScreen from '@/features/MagicLogin/MagicLogin.screen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="MagicLogin" component={MagicLoginScreen} />
    </Stack.Navigator>
  );
}
