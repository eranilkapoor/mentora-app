import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import OnboardingScreen from '@/features/Onboarding/Onboarding.screen';
import OnboardingSuccessScreen from '@/features/Onboarding/OnboardingSuccess.screen';
import { getSharedScreenOptions } from './sharedScreenOptions';
import { useTheme } from '@/core/theme/ThemeProvider';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack(): React.ReactElement {
  const { theme, reduceAnimations } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={getSharedScreenOptions(theme, reduceAnimations)}
    >
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <Stack.Screen
        name="OnboardingSuccess"
        component={OnboardingSuccessScreen}
      />
    </Stack.Navigator>
  );
}
