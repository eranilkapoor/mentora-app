import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTheme } from '../core/theme/ThemeProvider';
import { AppStackParamList } from './types';

import BottomTabs from './BottomTabs';
import NotificationsScreen from '../features/Notifications/NotificationsScreen';
import SettingsScreen from '../features/Settings/Settings.screen';
import ChangePasswordScreen from '../features/ChangePassword/ChangePassword.screen';
import ChatScreen from '../features/Chats/ChatScreen';
import MatchDetailScreen from '../features/MatchDetail/MatchDetailScreen';
import PrivacyPolicyScreen from '../features/PrivacyPolicy/PrivacyPolicyScreen';
import HelpSupportScreen from '../features/HelpSupport/HelpSupportScreen';
import NotificationSettingsScreen from '../features/NotificationSettings/NotificationSettingsScreen';
import EditProfileScreen from '../features/EditProfile/EditProfileScreen';
import OnlineMatchesScreen from '../features/OnlineMatches/OnlineMatchesScreen';
import LanguageScreen from '../features/Language/Language.screen';
import ThemeScreen from '../features/Theme/Theme.screen';

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
    animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
  };

  return (
    <Stack.Navigator screenOptions={sharedOptions}>
      {/* ── Root ── */}
      <Stack.Screen
        name="Tabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />

      {/* ── Profile & Account ── */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />

      {/* ── Settings ── */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="Languages"
        component={LanguageScreen}
        options={{ title: 'Language' }}
      />
      <Stack.Screen
        name="Themes"
        component={ThemeScreen}
        options={{ title: 'Appearance' }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Notifications' }}
      />

      {/* ── Matches ── */}
      <Stack.Screen
        name="MatchDetails"
        component={MatchDetailScreen}
        options={{ title: "Match Detail" }}
      />
      <Stack.Screen
        name="OnlineMatches"
        component={OnlineMatchesScreen}
        options={{ headerShown: false }}
      />

      {/* ── Chat ── */}
      <Stack.Screen
        name="ChatsDetail"
        component={ChatScreen}
        options={{ headerShown: false }}
      />

      {/* ── Notifications ── */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />

      {/* ── Support ── */}
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: 'Help & Support' }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
    </Stack.Navigator>
  );
}
