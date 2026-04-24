import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTheme } from '../core/theme/ThemeProvider';
import { MatchesStackParamList } from './types';

import { isAndroid } from '@/core/utils/device';
import MatchListScreen from '@/features/Matches/MatchList.screen';
import OnlineMatchesScreen from '@/features/OnlineMatches/OnlineMatchesScreen';
import MatchDetailsScreen from '@/features/MatchDetail/MatchDetail.screen';

const Stack = createNativeStackNavigator<MatchesStackParamList>();

export default function MatchesStack(): React.ReactElement {
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
        name="MatchList"
        component={MatchListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="OnlineMatches" component={OnlineMatchesScreen} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
    </Stack.Navigator>
  );
}
