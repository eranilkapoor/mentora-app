import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { MatchesStackParamList } from './types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import MatchListScreen from '@/features/Matches/MatchList.screen';
import MatchDetailsScreen from '@/features/MatchDetail/MatchDetail.screen';
import ChatScreen from '@/features/Chat/Chat.screen';

const Stack = createNativeStackNavigator<MatchesStackParamList>();

export default function MatchesStack(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      <Stack.Screen name="MatchList" component={MatchListScreen} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
      <Stack.Screen name="ChatDetails" component={ChatScreen} />
    </Stack.Navigator>
  );
}
