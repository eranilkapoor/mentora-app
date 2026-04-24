import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from './types';

import SettingsScreen from '@/features/Settings/Settings.screen';
import LanguageScreen from '@/features/Language/Language.screen';
import ThemeScreen from '@/features/Theme/Theme.screen';
import NotificationSettingsScreen from '@/features/NotificationSettings/NotificationSettingsScreen';
import HelpSupportScreen from '@/features/HelpSupport/HelpSupportScreen';
import PrivacyPolicyScreen from '@/features/PrivacyPolicy/PrivacyPolicyScreen';
import EditProfileScreen from '@/features/EditProfile/EditProfileScreen';
import ChangePasswordScreen from '@/features/ChangePassword/ChangePassword.screen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack(): React.ReactElement {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
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
