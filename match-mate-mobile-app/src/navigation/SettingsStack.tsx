import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { SettingsStackParamList } from '@/navigation/types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import SettingsScreen from '@/features/Settings/Settings.screen';
import EditPreferenceScreen from '@/features/EditPreference/EditPreferenceScreen';
import ChangePasswordScreen from '@/features/ChangePassword/ChangePassword.screen';
import LanguageScreen from '@/features/Language/Language.screen';
import ThemeScreen from '@/features/Theme/Theme.screen';
import NotificationSettingsScreen from '@/features/NotificationSettings/NotificationSettingsScreen';
import HelpSupportScreen from '@/features/HelpSupport/HelpSupportScreen';
import PrivacyPolicyScreen from '@/features/PrivacyPolicy/PrivacyPolicyScreen';
import EditProfileScreen from '@/features/EditProfile/EditProfile.screen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack(): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
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
      {/* Added EditPreference here */}
      <Stack.Screen
        name="EditPreference"
        component={EditPreferenceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: t('settings.change_password') }}
      />
      <Stack.Screen
        name="Languages"
        component={LanguageScreen}
        options={{ title: t('settings.language') }}
      />
      <Stack.Screen
        name="Themes"
        component={ThemeScreen}
        options={{ title: t('settings.theme') }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: t('settings.notifications') }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: t('settings.help_and_support') }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: t('settings.privacy_policy') }}
      />
    </Stack.Navigator>
  );
}