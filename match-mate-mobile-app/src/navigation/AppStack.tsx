import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { getSharedScreenOptions } from './sharedScreenOptions';

import BottomTabs from './BottomTabs';
import SettingsStack from './SettingsStack';
import { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack(): React.ReactElement {
  const { theme, reduceAnimations } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={getSharedScreenOptions(theme, reduceAnimations)}
    >
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="Settings" component={SettingsStack} />
    </Stack.Navigator>
  );
}
