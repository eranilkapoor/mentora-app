import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';

import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ChangePasswordScreen from '../screens/Settings/ChangePasswordScreen';
import ChatScreen from '../screens/Chats/ChatScreen';
import MatchDetailScreen from '../screens/Matches/MatchDetailScreen';
import PrivacyPolicyScreen from '../screens/Settings/PrivacyPolicyScreen';
import HelpSupportScreen from '../screens/Settings/HelpSupportScreen';
import NotificationSettingsScreen from '../screens/Settings/NotificationSettingsScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import OnlineMatchesScreen from '../screens/Matches/OnlineMatchesScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
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
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: 'Chat Screen' }}
      />
      <Stack.Screen
        name="MatchDetail"
        component={MatchDetailScreen}
        options={{ title: 'Match Detail' }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Notification Settings' }}
      />
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
      <Stack.Screen
        name="OnlineMatches"
        component={OnlineMatchesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
