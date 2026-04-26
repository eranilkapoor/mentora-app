import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { SettingsStackParamList } from './types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import SettingsScreen from '@/features/Settings/Settings.screen';
import EditProfileScreen from '@/features/EditProfile/EditProfile.screen';
import ChangePasswordScreen from '@/features/ChangePassword/ChangePassword.screen';
import LanguageScreen from '@/features/Language/Language.screen';
import ThemeScreen from '@/features/Theme/Theme.screen';
import NotificationSettingsScreen from '@/features/NotificationSettings/NotificationSettingsScreen';
import HelpSupportScreen from '@/features/HelpSupport/HelpSupportScreen';
import PrivacyPolicyScreen from '@/features/PrivacyPolicy/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack(): React.ReactElement {
  const { theme } = useTheme();

  return (
    // Now consistent with every other stack in the app
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Languages"
        component={LanguageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Themes"
        component={ThemeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
