import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ProfileStackParamList } from './types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import ProfileScreen from '@/features/Profile/Profile.screen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
