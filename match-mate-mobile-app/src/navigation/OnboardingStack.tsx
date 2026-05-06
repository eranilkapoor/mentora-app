import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import OnboardingScreen from '@/features/Onboarding/Onboarding.screen';
import { getSharedScreenOptions } from './sharedScreenOptions';
import { useTheme } from '@/core/theme/ThemeProvider';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}
