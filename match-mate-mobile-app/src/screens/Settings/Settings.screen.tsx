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
import { Colors } from '../../core/constants/colors';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
  toggleNotifications,
  toggleSound,
  toggleLocationSharing,
  toggleVibration,
} from '../../store/slices/settingsSlice';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { settingsStyles } from './SettingsScreen.styles';
import { SettingsScreenProps } from './Settings.types';
import { Section } from './components/Section';
import { SettingRow } from './components/SettingRow';
import { SettingToggle } from './components/SettingToggle';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen({
  navigation,
}: SettingsScreenProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const styles = useThemedStyles(settingsStyles);

  const themeMode = useAppSelector((s) => s.settings.theme);
  const language = useAppSelector((s) => s.settings.language);
  const locationSharing = useAppSelector((s) => s.settings.locationSharing);
  const soundEnabled = useAppSelector((s) => s.settings.soundEnabled);
  const vibrationEnabled = useAppSelector((s) => s.settings.vibrationEnabled);
  const notificationsEnabled = useAppSelector(
    (s) => s.settings.notificationsEnabled
  );

  const firstName = useAppSelector((s) => s.auth.user?.firstName ?? '');
  const lastName = useAppSelector((s) => s.auth.user?.lastName ?? '');
  const email = useAppSelector((s) => s.auth.user?.email ?? '');

  const themeBadge =
    themeMode === 'light'
      ? t('light')
      : themeMode === 'dark'
        ? t('dark')
        : t('system');

  const langBadge = language === 'en' ? t('english') : t('hindi');

  const handleSignOut = useCallback(() => {
    const doLogout = (): void => {
      void dispatch(logout());
    };

    if (Platform.OS === 'web') {
      if (
        window.confirm(
          t('sign_out_confirm', 'Are you sure you want to sign out?')
        )
      ) {
        doLogout();
      }
      return;
    }

    Alert.alert(
      t('sign_out'),
      t('sign_out_confirm', 'Are you sure you want to sign out?'),
      [
        { text: t('cancel', 'Cancel'), style: 'cancel' },
        { text: t('sign_out'), style: 'destructive', onPress: doLogout },
      ]
    );
  }, [dispatch, t]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Banner ───────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.profileBanner}
          onPress={() => navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Tabs',
                state: {
                  routes: [{name: 'Profile'}]
                }
              }
            ]
          })}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <View style={styles.profileAvatarWrapper}>
            <Feather name="user" size={24} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {`${firstName} ${lastName}`.trim() ||
                t('your_profile', 'Your Profile')}
            </Text>
            <Text style={styles.profileSubtext} numberOfLines={1}>
              {email || t('tap_to_edit', 'Tap to edit your profile')}
            </Text>
          </View>
          <View style={styles.profileChevron}>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* ── Account ──────────────────────────────────────────────── */}
        <Section icon="user" title={t('account')}>
          <SettingRow
            icon="edit-3"
            label={t('edit_profile')}
            subLabel={t('edit_profile_sub', 'Update your personal info')}
            onPress={() => navigation.navigate('EditProfile' as never)}
          />
          <SettingRow
            icon="lock"
            label={t('change_password')}
            subLabel={t('change_password_sub', 'Keep your account secure')}
            onPress={() => navigation.navigate('ChangePassword' as never)}
            isLast
          />
        </Section>

        {/* ── Preferences ──────────────────────────────────────────── */}
        <Section icon="sliders" title={t('preferences')}>
          <SettingRow
            icon="globe"
            label={t('language')}
            subLabel={t('language_sub', 'App display language')}
            badge={langBadge}
            onPress={() => navigation.navigate('Languages' as never)}
          />
          <SettingRow
            icon="sun"
            label={t('theme')}
            subLabel={t('theme_sub', 'Appearance & color scheme')}
            badge={themeBadge}
            onPress={() => navigation.navigate('Themes' as never)}
          />
          <SettingToggle
            icon="map-pin"
            label={t('share_location')}
            subLabel={t('share_location_sub', 'Help find nearby matches')}
            value={locationSharing}
            onValueChange={() => dispatch(toggleLocationSharing())}
            isLast
          />
        </Section>

        {/* ── App Settings ─────────────────────────────────────────── */}
        <Section icon="settings" title={t('app_settings')}>
          <SettingToggle
            icon="volume-2"
            label={t('sound')}
            subLabel={t('sound_sub', 'In-app sound effects')}
            value={soundEnabled}
            onValueChange={() => dispatch(toggleSound())}
          />
          <SettingToggle
            icon="smartphone"
            label={t('vibration')}
            subLabel={t('vibration_sub', 'Haptic feedback')}
            value={vibrationEnabled}
            onValueChange={() => dispatch(toggleVibration())}
            isLast
          />
        </Section>

        {/* ── Notifications ────────────────────────────────────────── */}
        <Section icon="bell" title={t('notifications')}>
          <SettingToggle
            icon="bell"
            label={t('app_notifications')}
            subLabel={t('notifications_sub', 'Messages, matches & updates')}
            value={notificationsEnabled}
            onValueChange={() => dispatch(toggleNotifications())}
          />
          <SettingRow
            icon="sliders"
            label={t('notification_settings')}
            subLabel={t(
              'notification_settings_sub',
              'Customize what you receive'
            )}
            onPress={() => navigation.navigate('NotificationSettings' as never)}
            isLast
          />
        </Section>

        {/* ── Support ──────────────────────────────────────────────── */}
        <Section icon="life-buoy" title={t('support')}>
          <SettingRow
            icon="help-circle"
            label={t('help_and_support')}
            subLabel={t('help_sub', 'FAQs and contact us')}
            onPress={() => navigation.navigate('HelpSupport' as never)}
          />
          <SettingRow
            icon="shield"
            label={t('privacy_policy')}
            subLabel={t('privacy_sub', 'How we handle your data')}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
            isLast
          />
        </Section>

        {/* ── Sign Out ─────────────────────────────────────────────── */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Feather name="log-out" size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>{t('sign_out')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>MatchMate v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
