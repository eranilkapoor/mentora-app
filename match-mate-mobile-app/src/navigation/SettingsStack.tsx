import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { SettingsStackParamList } from '@/navigation/types';
import { getSharedScreenOptions } from './sharedScreenOptions';

import SettingsScreen from '@/features/Settings/Settings.screen';
import EditPreferenceScreen from '@/features/EditPreference/EditPreference.screen';
import ChangePasswordScreen from '@/features/ChangePassword/ChangePassword.screen';
import NotificationSettingsScreen from '@/features/NotificationSettings/NotificationSettings.screen';
import HelpSupportScreen from '@/features/HelpSupport/HelpSupport.screen';
import SupportTicketsScreen from '@/features/HelpSupport/SupportTickets.screen';
import SupportTicketDetailScreen from '@/features/HelpSupport/SupportTicketDetail.screen';
import {
  AccountDeletionScreen,
  CommunityGuidelinesScreen,
  FaqsScreen,
  PrivacyPolicyScreen,
  TermsConditionsScreen,
} from '@/features/StaticPage/staticPageScreens';
import EditProfileScreen from '@/features/EditProfile/EditProfile.screen';
import AccountSettingsScreen from '@/features/AccountSettings/AccountSettings.screen';
import ChangeEmailPhoneScreen from '@/features/AccountSettings/ChangeEmailPhone.screen';
import LinkedAccountsScreen from '@/features/AccountSettings/LinkedAccounts.screen';
import KycVerificationScreen from '@/features/AccountSettings/KycVerification.screen';
import ManageDevicesScreen from '@/features/SecuritySettings/ManageDevices.screen';
import LoginHistoryScreen from '@/features/SecuritySettings/LoginHistory.screen';
import TwoFactorSetupScreen from '@/features/SecuritySettings/TwoFactorSetup.screen';
import BlockedUsersScreen from '@/features/PrivacySettings/BlockedUsers.screen';
import PrivacySettingsScreen from '@/features/PrivacySettings/PrivacySettings.screen';
import CommunicationSettingsScreen from '@/features/CommunicationSettings/CommunicationSettings.screen';
import SecuritySettingsScreen from '@/features/SecuritySettings/SecuritySettings.screen';
import LocalizationSettingsScreen from '@/features/LocalizationSettings/LocalizationSettings.screen';
import MediaSettingsScreen from '@/features/MediaSettings/MediaSettings.screen';
import AccessibilitySettingsScreen from '@/features/AccessibilitySettings/AccessibilitySettings.screen';
import AiSettingsScreen from '@/features/AiSettings/AiSettings.screen';
import SubscriptionBillingScreen from '@/features/SubscriptionBilling/SubscriptionBilling.screen';
import ReferRewardsScreen from '@/features/ReferRewards/ReferRewards.screen';

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
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: t('settings.notifications.title') }}
      />
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ title: t('settings.account_settings') }}
      />
      <Stack.Screen
        name="ChangeEmailPhone"
        component={ChangeEmailPhoneScreen}
      />
      <Stack.Screen name="LinkedAccounts" component={LinkedAccountsScreen} />
      <Stack.Screen
        name="ProfileVerification"
        component={KycVerificationScreen}
        options={{ title: t('settings.kyc.title') }}
      />
      <Stack.Screen
        name="ManageDevices"
        component={ManageDevicesScreen}
        options={{ title: t('settings.security.manage_devices') }}
      />
      <Stack.Screen
        name="LoginHistory"
        component={LoginHistoryScreen}
        options={{ title: t('settings.security.login_history_title') }}
      />
      <Stack.Screen
        name="TwoFactorSetup"
        component={TwoFactorSetupScreen}
        options={{ title: t('settings.two_factor.title') }}
      />
      <Stack.Screen
        name="SubscriptionBilling"
        component={SubscriptionBillingScreen}
        options={{ title: t('membership.billing.title') }}
      />
      <Stack.Screen
        name="ReferRewards"
        component={ReferRewardsScreen}
        options={{ title: t('settings.referrals.title') }}
      />
      <Stack.Screen
        name="BlockedUsers"
        component={BlockedUsersScreen}
        options={{ title: t('settings.blocked_users') }}
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
        name="SupportTickets"
        component={SupportTicketsScreen}
        options={{ title: t('settings.support_tickets.title') }}
      />
      <Stack.Screen
        name="SupportTicketDetail"
        component={SupportTicketDetailScreen}
        options={{ title: t('settings.support_tickets.detail_title') }}
      />
      <Stack.Screen
        name="Faqs"
        component={FaqsScreen}
        options={{ title: t('settings.support_center.faqs') }}
      />
      <Stack.Screen
        name="CommunityGuidelines"
        component={CommunityGuidelinesScreen}
        options={{ title: t('settings.support_center.community_guidelines') }}
      />
      <Stack.Screen
        name="AccountDeletion"
        component={AccountDeletionScreen}
        options={{ title: t('settings.support_center.account_deletion') }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: t('settings.privacy_policy') }}
      />
      <Stack.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
        options={{ title: t('settings.terms_conditions') }}
      />
    </Stack.Navigator>
  );
}
