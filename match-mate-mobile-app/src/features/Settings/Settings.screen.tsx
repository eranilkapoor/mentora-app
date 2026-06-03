import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';

import { useNavigation } from '@react-navigation/native';

import { useTranslation } from 'react-i18next';

import Constants from 'expo-constants';

import Header from '@/core/components/Header';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { settingsStyles } from './Settings.styles';

import { AppNavigationProp } from '@/navigation/types';

import { logout as logoutAction } from '@/store/slices/auth.slice';

import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { useLogoutMutation } from '@/store/services/authApi.service';
import { baseApi, clearRefreshToken } from '@/store/services/baseApi.service';
import { useGetMyProfileQuery } from '@/store/services/profileApi.service';
import { Section } from './components/Section';
import { SettingRow } from './components/SettingRow';
import { SettingsScreenProps } from './Settings.types';
import { showConfirm } from '@/core/utils/confirm';

const clampProfileCompletion = (value?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
};

export default function SettingsScreen({
  navigation,
}: SettingsScreenProps): React.ReactElement {
  const dispatch = useAppDispatch();

  const appNavigation = useNavigation<AppNavigationProp>();

  const styles = useThemedStyles(settingsStyles);

  const { theme } = useTheme();

  const { t } = useTranslation();

  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { data: profileResponse } = useGetMyProfileQuery();

  // ─────────────────────────────────────────────
  // Redux State
  // ─────────────────────────────────────────────

  const user = useAppSelector((s) => s.auth.user);

  // ─────────────────────────────────────────────
  // Derived
  // ─────────────────────────────────────────────

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const profileCompletion = clampProfileCompletion(
    profileResponse?.success
      ? profileResponse.data.profileCompletionPercentage
      : undefined
  );
  const completionColor =
    profileCompletion >= 100 ? theme.colors.success : theme.colors.primary;

  // ─────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────

  const performLogout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      await clearRefreshToken();
      dispatch(logoutAction());
      dispatch(baseApi.util.resetApiState());

      appNavigation.reset({
        index: 0,
        routes: [{ name: 'Tabs' }],
      });
    }
  }, [dispatch, logoutMutation, appNavigation]);

  const handleSignOut = useCallback(() => {
    if (isLoggingOut) return;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(t('settings.sign_out_confirm'));

      if (confirmed) {
        void performLogout();
      }

      return;
    }

    showConfirm({
      title: t('settings.sign_out'),
      message: t('settings.sign_out_confirm'),
      confirmText: t('settings.sign_out'),
      onConfirm: () => {
        void performLogout();
      },
    });
  }, [isLoggingOut, performLogout, t]);

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={t('settings.title')}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ───────────────────────────── */}
        {/* Profile Banner */}
        {/* ───────────────────────────── */}

        <Pressable
          style={({ pressed }) => [
            styles.profileBanner,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            appNavigation.navigate('Tabs', {
              screen: 'Profile',
            })
          }
        >
          <View style={styles.profileAvatar}>
            <Feather name="user" size={26} color={theme.colors.primary} />
          </View>

          <View style={styles.profileContent}>
            <Text style={styles.profileName}>
              {fullName || t('profile.your_profile')}
            </Text>

            <Text style={styles.profileEmail}>
              {user?.email ?? t('profile.tap_to_view')}
            </Text>

            <View style={styles.progressWrapper}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${profileCompletion}%`,
                      backgroundColor: completionColor,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.progressText, { color: completionColor }]}>
                {profileCompletion}% Complete
              </Text>
            </View>
          </View>

          <Feather
            name="chevron-right"
            size={18}
            color={theme.colors.textMuted}
          />
        </Pressable>

        {/* Profile & Matchmaking */}

        <Section icon="heart" title={t('settings.profile_matchmaking')}>
          <SettingRow
            icon="edit-3"
            label={t('settings.edit_profile')}
            subLabel={t('settings.edit_profile_sub')}
            onPress={() => navigation.navigate('EditProfile')}
          />

          <SettingRow
            icon="sliders"
            label={t('settings.edit_preferences')}
            subLabel={t('settings.edit_preferences_sub')}
            onPress={() => navigation.navigate('EditPreference')}
          />

          <SettingRow
            icon="cpu"
            label={t('settings.ai_settings')}
            subLabel={t('settings.ai_settings_sub')}
            onPress={() => navigation.navigate('AiSettings')}
            isLast
          />
        </Section>

        {/* Membership & Billing */}

        <Section icon="credit-card" title={t('settings.membership_billing')}>
          <SettingRow
            icon="credit-card"
            label={t('membership.billing.title')}
            subLabel={t('settings.subscription_billing_sub')}
            onPress={() => navigation.navigate('SubscriptionBilling')}
          />
          <SettingRow
            icon="gift"
            label={t('settings.referrals.title')}
            subLabel={t('settings.referrals_sub')}
            onPress={() => navigation.navigate('ReferRewards')}
            isLast
          />
        </Section>

        {/* Privacy, Safety & Communication */}

        <Section icon="shield" title={t('settings.privacy_safety')}>
          <SettingRow
            icon="user-check"
            label={t('settings.account_settings')}
            subLabel={t('settings.account_settings_sub')}
            onPress={() => navigation.navigate('AccountSettings')}
          />

          <SettingRow
            icon="lock"
            label={t('settings.security_settings')}
            subLabel={t('settings.security_settings_sub')}
            onPress={() => navigation.navigate('SecuritySettings')}
          />
          <SettingRow
            icon="shield"
            label={t('settings.privacy_settings')}
            subLabel={t('settings.privacy_settings_sub')}
            onPress={() => navigation.navigate('PrivacySettings')}
          />
          <SettingRow
            icon="slash"
            label={t('settings.blocked_users')}
            subLabel={t('settings.blocked_users_sub')}
            onPress={() => navigation.navigate('BlockedUsers')}
          />

          <SettingRow
            icon="message-square"
            label={t('settings.communication_settings')}
            subLabel={t('settings.communication_settings_sub')}
            onPress={() => navigation.navigate('CommunicationSettings')}
            isLast
          />
        </Section>

        {/* App Experience */}

        <Section icon="settings" title={t('settings.app_experience')}>
          <SettingRow
            icon="shield"
            label={t('settings.accessibility_settings')}
            subLabel={t('settings.accessibility_settings_sub')}
            onPress={() => navigation.navigate('AccessibilitySettings')}
          />
          <SettingRow
            icon="image"
            label={t('settings.media_settings')}
            subLabel={t('settings.media_settings_sub')}
            onPress={() => navigation.navigate('MediaSettings')}
          />
          <SettingRow
            icon="globe"
            label={t('settings.localization_settings')}
            subLabel={t('settings.localization_settings_sub')}
            onPress={() => navigation.navigate('LocalizationSettings')}
          />

          <SettingRow
            icon="bell"
            label={t('settings.notification_settings.title')}
            subLabel={t('settings.notification_settings_sub')}
            onPress={() => navigation.navigate('NotificationSettings')}
            isLast
          />
        </Section>

        {/* Support */}

        <Section icon="help-circle" title={t('settings.support')}>
          <SettingRow
            icon="life-buoy"
            label={t('settings.help_and_support')}
            subLabel="Support, FAQs, community guidelines, and legal policies"
            onPress={() => navigation.navigate('HelpSupport')}
            isLast
          />
        </Section>

        {/* Danger Zone */}

        <Section icon="alert-triangle" title={t('settings.danger_zone')}>
          <SettingRow
            icon="log-out"
            label={
              isLoggingOut ? t('settings.signing_out') : t('settings.sign_out')
            }
            subLabel={t('settings.sign_out_sub')}
            onPress={handleSignOut}
            isDanger
            isLast
          />
        </Section>

        {/* Footer */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>MatchMate v{appVersion}</Text>

          <Text style={styles.footerSubtext}>
            {t('settings.footer_credit')}
          </Text>
        </View>
      </ScrollView>

      {isLoggingOut && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}
