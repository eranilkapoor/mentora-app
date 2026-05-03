import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { MatchesStackParamList } from './types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import MatchListScreen from '@/features/Matches/MatchList.screen';
import OnlineMatchesScreen from '@/features/OnlineMatches/OnlineMatches.screen';
import MatchDetailsScreen from '@/features/MatchDetail/MatchDetail.screen';

const Stack = createNativeStackNavigator<MatchesStackParamList>();

export default function MatchesStack(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      <Stack.Screen name="MatchList" component={MatchListScreen} />
      <Stack.Screen name="OnlineMatches" component={OnlineMatchesScreen} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
    </Stack.Navigator>
  );
}
