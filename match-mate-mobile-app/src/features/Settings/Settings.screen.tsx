import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/authSlice';

import {
  toggleNotifications,
  toggleSound,
  toggleLocationSharing,
  toggleVibration,
} from '@/store/slices/settingsSlice';

import { useLogoutMutation } from '@/store/services/authApi';

import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';

import { settingsStyles } from './Settings.styles';
import { SettingsScreenProps } from './Settings.types';

import { Section } from './components/Section';
import { SettingRow } from './components/SettingRow';
import { SettingToggle } from './components/SettingToggle';

import Header from '@/core/components/Header';

import { AppNavigationProp } from '@/navigation/types';

import Constants from 'expo-constants';

import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen({
  navigation,
}: SettingsScreenProps): React.ReactElement {
  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const styles = useThemedStyles(settingsStyles);

  const { theme } = useTheme();

  const appNavigation = useNavigation<AppNavigationProp>();

  const [logoutMutation, { isLoading: isLoggingOut }] =
    useLogoutMutation();

  // ─────────────────────────────────────────────────────────────
  // Redux State
  // ─────────────────────────────────────────────────────────────

  const themeMode = useAppSelector((s) => s.settings.theme);

  const language = useAppSelector((s) => s.settings.language);

  const locationSharing = useAppSelector(
    (s) => s.settings.locationSharing
  );

  const soundEnabled = useAppSelector(
    (s) => s.settings.soundEnabled
  );

  const vibrationEnabled = useAppSelector(
    (s) => s.settings.vibrationEnabled
  );

  const notificationsEnabled = useAppSelector(
    (s) => s.settings.notificationsEnabled
  );

  const firstName = useAppSelector(
    (s) => s.auth.user?.firstName ?? ''
  );

  const lastName = useAppSelector(
    (s) => s.auth.user?.lastName ?? ''
  );

  const email = useAppSelector(
    (s) => s.auth.user?.email ?? ''
  );

  // ─────────────────────────────────────────────────────────────
  // Constants
  // ─────────────────────────────────────────────────────────────

  const appVersion =
    Constants.expoConfig?.version ?? '1.0.0';

  const themeBadge =
    themeMode === 'light'
      ? t('theme.light')
      : themeMode === 'dark'
        ? t('theme.dark')
        : t('theme.system');

  const langBadge =
    language === 'en'
      ? t('language.english')
      : t('language.hindi');

  // ─────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────

  const performLogout = useCallback(async (): Promise<void> => {
    try {
      /**
       * 1. Call backend logout API
       *
       * Web:
       * - refresh token comes automatically from cookie
       *
       * Mobile:
       * - refresh token sent from RTK Query mutation body
       */
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout API Error:', error);
    } finally {
      /**
       * 2. Always clear mobile refresh token
       */
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('refreshToken');
      }

      /**
       * 3. Clear redux auth state
       */
      dispatch(logoutAction());

      /**
       * 4. Reset navigation to auth flow
       */
      appNavigation.reset({
        index: 0,
        routes: [{ name: 'Tabs' }],
      });
    }
  }, [dispatch, logoutMutation, appNavigation]);

  const handleSignOut = useCallback(() => {
    if (isLoggingOut) {
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        t('settings.sign_out_confirm')
      );

      if (confirmed) {
        void performLogout();
      }

      return;
    }

    Alert.alert(
      t('settings.sign_out'),
      t('settings.sign_out_confirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.sign_out'),
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ]
    );
  }, [isLoggingOut, performLogout, t]);

  // ─────────────────────────────────────────────────────────────
  // Profile Banner Navigation
  // ─────────────────────────────────────────────────────────────

  const handleProfileBannerPress = useCallback(() => {
    appNavigation.navigate('Tabs');
  }, [appNavigation]);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.title')}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ───────────────────────────────────────────── */}
        {/* Profile Banner */}
        {/* ───────────────────────────────────────────── */}

        <TouchableOpacity
          style={styles.profileBanner}
          onPress={handleProfileBannerPress}
          accessibilityRole="button"
          accessibilityLabel={t('profile.view_profile')}
          activeOpacity={0.8}
        >
          <View style={styles.profileAvatarWrapper}>
            <Feather
              name="user"
              size={24}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {`${firstName} ${lastName}`.trim() ||
                t('profile.your_profile')}
            </Text>

            <Text
              style={styles.profileSubtext}
              numberOfLines={1}
            >
              {email || t('profile.tap_to_view')}
            </Text>
          </View>

          <View style={styles.profileChevron}>
            <Feather
              name="chevron-right"
              size={16}
              color={theme.colors.textMuted}
            />
          </View>
        </TouchableOpacity>

        {/* ───────────────────────────────────────────── */}
        {/* Account */}
        {/* ───────────────────────────────────────────── */}

        <Section
          icon="user"
          title={t('settings.account')}
        >
          <SettingRow
            icon="edit-3"
            label={t('settings.edit_profile')}
            subLabel={t('settings.edit_profile_sub')}
            onPress={() =>
              navigation.navigate('EditProfile')
            }
          />

          <SettingRow
            icon="lock"
            label={t('settings.change_password')}
            subLabel={t(
              'settings.change_password_sub'
            )}
            onPress={() =>
              navigation.navigate('ChangePassword')
            }
            isLast
          />
        </Section>

        {/* ───────────────────────────────────────────── */}
        {/* Partner Preferences */}
        {/* ───────────────────────────────────────────── */}

        <Section
          icon="heart"
          title={t('settings.partner_preferences')}
        >
          <SettingRow
            icon="sliders"
            label={t('settings.edit_preferences')}
            subLabel={t(
              'settings.edit_preferences_sub'
            )}
            onPress={() =>
              navigation.navigate('EditPreference')
            }
            isLast
          />
        </Section>

        {/* ───────────────────────────────────────────── */}
        {/* App Settings */}
        {/* ───────────────────────────────────────────── */}

        <Section
          icon="settings"
          title={t('settings.app_settings')}
        >
          <SettingRow
            icon="globe"
            label={t('settings.language')}
            subLabel={t('settings.language_sub')}
            badge={langBadge}
            onPress={() =>
              navigation.navigate('Languages')
            }
          />

          <SettingRow
            icon="sun"
            label={t('settings.theme')}
            subLabel={t('settings.theme_sub')}
            badge={themeBadge}
            onPress={() =>
              navigation.navigate('Themes')
            }
          />

          <SettingToggle
            icon="volume-2"
            label={t('settings.sound')}
            subLabel={t('settings.sound_sub')}
            value={soundEnabled}
            onValueChange={() =>
              dispatch(toggleSound())
            }
          />

          <SettingToggle
            icon="smartphone"
            label={t('settings.vibration')}
            subLabel={t('settings.vibration_sub')}
            value={vibrationEnabled}
            onValueChange={() =>
              dispatch(toggleVibration())
            }
          />

          <SettingToggle
            icon="map-pin"
            label={t('settings.share_location')}
            subLabel={t(
              'settings.share_location_sub'
            )}
            value={locationSharing}
            onValueChange={() =>
              dispatch(toggleLocationSharing())
            }
            isLast
          />
        </Section>

        {/* ───────────────────────────────────────────── */}
        {/* Notifications */}
        {/* ───────────────────────────────────────────── */}

        <Section
          icon="bell"
          title={t('settings.notifications')}
        >
          <SettingToggle
            icon="bell"
            label={t('settings.app_notifications')}
            subLabel={t(
              'settings.notifications_sub'
            )}
            value={notificationsEnabled}
            onValueChange={() =>
              dispatch(toggleNotifications())
            }
          />

          <SettingRow
            icon="sliders"
            label={t(
              'settings.notification_settings'
            )}
            subLabel={t(
              'settings.notification_settings_sub'
            )}
            onPress={() =>
              navigation.navigate(
                'NotificationSettings'
              )
            }
            isLast
          />
        </Section>

        {/* ───────────────────────────────────────────── */}
        {/* Support */}
        {/* ───────────────────────────────────────────── */}

        <Section
          icon="life-buoy"
          title={t('settings.support')}
        >
          <SettingRow
            icon="help-circle"
            label={t(
              'settings.help_and_support'
            )}
            subLabel={t('settings.help_sub')}
            onPress={() =>
              navigation.navigate('HelpSupport')
            }
          />

          <SettingRow
            icon="shield"
            label={t(
              'settings.privacy_policy'
            )}
            subLabel={t('settings.privacy_sub')}
            onPress={() =>
              navigation.navigate('PrivacyPolicy')
            }
            isLast
          />
        </Section>

        {/* ───────────────────────────────────────────── */}
        {/* Danger Zone */}
        {/* ───────────────────────────────────────────── */}

        <Section
          icon="alert-triangle"
          title={t('settings.danger_zone')}
        >
          <SettingRow
            icon="log-out"
            label={
              isLoggingOut
                ? t('common.loading')
                : t('settings.sign_out')
            }
            subLabel={t(
              'settings.sign_out_sub'
            )}
            onPress={handleSignOut}
            isDanger
            isLast
          />
        </Section>

        {/* ───────────────────────────────────────────── */}
        {/* Version */}
        {/* ───────────────────────────────────────────── */}

        <Text style={styles.versionText}>
          {t('settings.version', {
            version: appVersion,
          })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}