import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { HomeStackParamList } from './types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import HomeScreen from '@/features/Home/HomeScreen';
import NotificationsScreen from '@/features/Notifications/Notifications.screen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
