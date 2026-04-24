import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTheme } from '../core/theme/ThemeProvider';
import { AppStackParamList } from './types';

import BottomTabs from './BottomTabs';
import { isAndroid } from '@/core/utils/device';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack(): React.ReactElement {
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
      {/* ── Root ── */}
      <Stack.Screen
        name="Tabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
