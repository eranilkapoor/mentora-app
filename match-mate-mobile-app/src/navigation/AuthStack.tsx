import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

import LoginScreen from '@/features/Login/Login.screen';
import RegisterScreen from '@/features/Register/RegisterScreen';
import ForgotPasswordScreen from '@/features/ForgotPassword/ForgotPasswordScreen';
import ResetPasswordScreen from '@/features/ResetPassword/ResetPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
