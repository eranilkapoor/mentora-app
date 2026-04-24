import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTheme } from '../core/theme/ThemeProvider';
import { ChatsStackParamList } from './types';

import { isAndroid } from '@/core/utils/device';
import ChatListScreen from '@/features/ChatList/ChatListScreen';
import ChatScreen from '@/features/Chats/ChatScreen';

const Stack = createNativeStackNavigator<ChatsStackParamList>();

export default function ChatsStack(): React.ReactElement {
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
