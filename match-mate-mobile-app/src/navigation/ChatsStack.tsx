import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ChatsStackParamList } from './types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import ChatListScreen from '@/features/ChatList/ChatListScreen';
import ChatScreen from '@/features/Chats/ChatScreen';

const Stack = createNativeStackNavigator<ChatsStackParamList>();

export default function ChatsStack(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatDetails"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
