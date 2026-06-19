import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ProfileStackParamList } from './types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import ProfileScreen from '@/features/Profile/Profile.screen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack(): React.ReactElement {
  const { theme, reduceAnimations } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={getSharedScreenOptions(theme, reduceAnimations)}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
