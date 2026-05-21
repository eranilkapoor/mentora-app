import React, { useCallback, useMemo } from 'react';
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

import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';

import Header from '@/core/components/Header';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { settingsStyles } from './Settings.styles';

import { AppNavigationProp } from '@/navigation/types';

import {
  toggleLocationSharing,
  toggleNotifications,
  toggleSound,
  toggleVibration,
} from '@/store/slices/settingsSlice';

import { logout as logoutAction } from '@/store/slices/authSlice';

import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { useLogoutMutation } from '@/store/services/authApi';
import { Section } from './components/Section';
import { SettingRow } from './components/SettingRow';
import { SettingToggle } from './components/SettingToggle';
import { SettingsScreenProps } from './Settings.types';
import { showConfirm } from '@/core/utils/confirm';

export default function SettingsScreen({
  navigation,
}: SettingsScreenProps): React.ReactElement {
  const dispatch = useAppDispatch();

  const appNavigation = useNavigation<AppNavigationProp>();

  const styles = useThemedStyles(settingsStyles);

  const { theme } = useTheme();

  const { t } = useTranslation();

  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  // ─────────────────────────────────────────────
  // Redux State
  // ─────────────────────────────────────────────

  const settings = useAppSelector((s) => s.settings);

  const user = useAppSelector((s) => s.auth.user);

  const {
    theme: themeMode,
    language,
    locationSharing,
    soundEnabled,
    vibrationEnabled,
    notificationsEnabled,
  } = settings;

  // ─────────────────────────────────────────────
  // Derived
  // ─────────────────────────────────────────────

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const profileCompletion = 78;

  const themeBadge =
    themeMode === 'light'
      ? t('theme.light')
      : themeMode === 'dark'
        ? t('theme.dark')
        : t('theme.system');

  const themeIcon =
    themeMode === 'light' ? 'sun' : themeMode === 'dark' ? 'moon' : 'monitor';

  const langBadge =
    language === 'en' ? t('language.english') : t('language.hindi');

  // ─────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────

  const performLogout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('refreshToken');
      }

      dispatch(logoutAction());

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

  // ─────────────────────────────────────────────
  // Sections
  // ─────────────────────────────────────────────

  const appSettings = useMemo(
    () => [
      {
        type: 'row',
        icon: 'globe',
        label: t('settings.language'),
        subLabel: t('settings.language_sub'),
        badge: langBadge,
        onPress: () => navigation.navigate('Languages'),
      },
      {
        type: 'row',
        icon: themeIcon,
        label: t('settings.theme'),
        subLabel: t('settings.theme_sub'),
        badge: themeBadge,
        onPress: () => navigation.navigate('Themes'),
      },
      {
        type: 'toggle',
        icon: 'volume-2',
        label: t('settings.sound'),
        subLabel: t('settings.sound_sub'),
        value: soundEnabled,
        onValueChange: () => dispatch(toggleSound()),
      },
      {
        type: 'toggle',
        icon: 'smartphone',
        label: t('settings.vibration'),
        subLabel: t('settings.vibration_sub'),
        value: vibrationEnabled,
        onValueChange: () => dispatch(toggleVibration()),
      },
      {
        type: 'toggle',
        icon: 'map-pin',
        label: t('settings.share_location'),
        subLabel: t('settings.share_location_sub'),
        value: locationSharing,
        onValueChange: () => dispatch(toggleLocationSharing()),
      },
    ],
    [
      dispatch,
      langBadge,
      locationSharing,
      navigation,
      soundEnabled,
      t,
      themeBadge,
      themeIcon,
      vibrationEnabled,
    ]
  );

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
          onPress={() => appNavigation.navigate('Tabs')}
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
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
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

        {/* Account */}

        <Section icon="user" title={t('settings.account')}>
          <SettingRow
            icon="edit-3"
            label={t('settings.edit_profile')}
            subLabel={t('settings.edit_profile_sub')}
            onPress={() => navigation.navigate('EditProfile')}
          />

          <SettingRow
            icon="lock"
            label={t('settings.change_password')}
            subLabel={t('settings.change_password_sub')}
            onPress={() => navigation.navigate('ChangePassword')}
            isLast
          />
        </Section>

        {/* Partner Preferences */}

        <Section icon="heart" title={t('settings.partner_preferences')}>
          <SettingRow
            icon="sliders"
            label={t('settings.edit_preferences')}
            subLabel={t('settings.edit_preferences_sub')}
            onPress={() => navigation.navigate('EditPreference')}
            isLast
          />
        </Section>

        {/* Privacy */}

        <Section icon="shield" title="Privacy & Safety">
          <SettingRow
            icon="eye-off"
            label="Profile Visibility"
            subLabel="Control who can view you"
            onPress={() => {}}
          />

          <SettingRow
            icon="image"
            label="Photo Privacy"
            subLabel="Manage private photos"
            onPress={() => {}}
          />

          <SettingRow
            icon="slash"
            label="Blocked Users"
            subLabel="Manage blocked profiles"
            onPress={() => {}}
            isLast
          />
        </Section>

        {/* App Settings */}

        <Section icon="settings" title={t('settings.app_settings')}>
          {appSettings.map((item, index) => {
            const isLast = index === appSettings.length - 1;

            if (item.type === 'row') {
              return (
                <SettingRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  subLabel={item.subLabel}
                  badge={item.badge}
                  onPress={item.onPress}
                  isLast={isLast}
                />
              );
            }

            return (
              <SettingToggle
                key={item.label}
                icon={item.icon}
                label={item.label}
                subLabel={item.subLabel}
                value={item.value}
                onValueChange={item.onValueChange}
                isLast={isLast}
              />
            );
          })}
        </Section>

        {/* Notifications */}

        <Section icon="bell" title={t('settings.notifications')}>
          <SettingToggle
            icon="bell"
            label="App Notifications"
            subLabel="Messages, matches & updates"
            value={notificationsEnabled}
            onValueChange={() => dispatch(toggleNotifications())}
          />

          <SettingRow
            icon="sliders"
            label="Notification Settings"
            subLabel="Customize alerts"
            disabled={!notificationsEnabled}
            onPress={() => navigation.navigate('NotificationSettings')}
            isLast
          />
        </Section>

        {/* Support */}

        <Section icon="help-circle" title={t('settings.support')}>
          <SettingRow
            icon="life-buoy"
            label="Help & Support"
            subLabel="FAQs and contact support"
            onPress={() => navigation.navigate('HelpSupport')}
          />

          <SettingRow
            icon="shield"
            label="Privacy Policy"
            subLabel="How we handle your data"
            onPress={() => navigation.navigate('PrivacyPolicy')}
            isLast
          />
        </Section>

        {/* Danger Zone */}

        <Section icon="alert-triangle" title="Danger Zone">
          <SettingRow
            icon="log-out"
            label={isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            subLabel="Logout from this device"
            onPress={handleSignOut}
            isDanger
          />

          <SettingRow
            icon="trash-2"
            label="Delete Account"
            subLabel="Permanently remove account"
            onPress={() => {}}
            isDanger
            isLast
          />
        </Section>

        {/* Footer */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>MatchMate v{appVersion}</Text>

          <Text style={styles.footerSubtext}>Made with ❤️ by Webnza</Text>
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
