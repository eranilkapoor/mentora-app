import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTheme } from '../core/theme/ThemeProvider';
import { ProfileStackParamList } from './types';

import { isAndroid } from '@/core/utils/device';
import ProfileScreen from '@/features/Profile/Profile.screen';
import SettingsStack from './SettingsStack';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack(): React.ReactElement {
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
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
