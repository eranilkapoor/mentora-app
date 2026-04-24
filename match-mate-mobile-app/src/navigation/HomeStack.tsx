import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTheme } from '../core/theme/ThemeProvider';
import { HomeStackParamList } from './types';

import NotificationsScreen from '../features/Notifications/Notifications.screen';
import { isAndroid } from '@/core/utils/device';
import HomeScreen from '@/features/Home/HomeScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack(): React.ReactElement {
  const { theme } = useTheme();

  const sharedOptions: NativeStackNavigationOptions = {
    headerStyle: {
      backgroundColor: theme.colors.white,
    },
    headerTitleStyle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    headerTintColor: theme.colors.primary,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: {
      backgroundColor: theme.colors.backgroundPage,
    },
    animation: isAndroid ? 'slide_from_right' : 'default',
  };

  return (
    <Stack.Navigator screenOptions={sharedOptions}>
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
