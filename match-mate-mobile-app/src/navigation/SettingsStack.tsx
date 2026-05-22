import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { SettingsStackParamList } from '@/navigation/types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import SettingsScreen from '@/features/Settings/Settings.screen';
import EditPreferenceScreen from '@/features/EditPreference/EditPreference.screen';
import ChangePasswordScreen from '@/features/ChangePassword/ChangePassword.screen';
import LanguageScreen from '@/features/Language/Language.screen';
import ThemeScreen from '@/features/Theme/Theme.screen';
import NotificationSettingsScreen from '@/features/NotificationSettings/NotificationSettings.screen';
import HelpSupportScreen from '@/features/HelpSupport/HelpSupport.screen';
import PrivacyPolicyScreen from '@/features/PrivacyPolicy/PrivacyPolicy.screen';
import EditProfileScreen from '@/features/EditProfile/EditProfile.screen';
import AccountSettingsScreen from '@/features/AccountSettings/AccountSettingsScreen';
import PrivacySettingsScreen from '@/features/PrivacySettings/PrivacySettingsScreen';
import CommunicationSettingsScreen from '@/features/CommunicationSettings/CommunicationSettingsScreen';
import SecuritySettingsScreen from '@/features/SecuritySettings/SecuritySettingsScreen';
import LocalizationSettingsScreen from '@/features/LocalizationSettings/LocalizationSettingsScreen';
import MediaSettingsScreen from '@/features/MediaSettings/MediaSettingsScreen';
import AccessibilitySettingsScreen from '@/features/AccessibilitySettings/AccessibilitySettingsScreen';
import AiSettingsScreen from '@/features/AiSettings/AiSettingsScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack(): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={getSharedScreenOptions(theme)}>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="EditPreference" component={EditPreferenceScreen} />
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
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ title: t('settings.account_settings') }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ title: t('settings.privacy_settings') }}
      />
      <Stack.Screen
        name="CommunicationSettings"
        component={CommunicationSettingsScreen}
        options={{ title: t('settings.communication_settings') }}
      />
      <Stack.Screen
        name="AccessibilitySettings"
        component={AccessibilitySettingsScreen}
        options={{ title: t('settings.accessibility_settings') }}
      />
      <Stack.Screen
        name="AiSettings"
        component={AiSettingsScreen}
        options={{ title: t('settings.ai_settings') }}
      />
      <Stack.Screen
        name="MediaSettings"
        component={MediaSettingsScreen}
        options={{ title: t('settings.media_settings') }}
      />
      <Stack.Screen
        name="LocalizationSettings"
        component={LocalizationSettingsScreen}
        options={{ title: t('settings.localization_settings') }}
      />
      <Stack.Screen
        name="SecuritySettings"
        component={SecuritySettingsScreen}
        options={{ title: t('settings.security_settings') }}
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
