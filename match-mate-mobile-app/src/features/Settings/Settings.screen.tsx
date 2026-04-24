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
import { settingsStyles } from './Settings.styles';
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
      ? t('theme.light')
      : themeMode === 'dark'
        ? t('theme.dark')
        : t('theme.system');

  const langBadge =
    language === 'en' ? t('language.english') : t('language.hindi');

  const handleSignOut = useCallback(() => {
    const doLogout = (): void => {
      void dispatch(logout());
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('settings.sign_out_confirm'))) {
        doLogout();
      }
      return;
    }

    Alert.alert(t('settings.sign_out'), t('settings.sign_out_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.sign_out'), style: 'destructive', onPress: doLogout },
    ]);
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
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Tabs',
                  state: {
                    routes: [{ name: 'Profile' }],
                  },
                },
              ],
            })
          }
          accessibilityRole="button"
          accessibilityLabel={t('profile.edit_profile')}
        >
          <View style={styles.profileAvatarWrapper}>
            <Feather name="user" size={24} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {`${firstName} ${lastName}`.trim() || t('profile.your_profile')}
            </Text>
            <Text style={styles.profileSubtext} numberOfLines={1}>
              {email || t('profile.tap_to_edit')}
            </Text>
          </View>
          <View style={styles.profileChevron}>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* ── Account ──────────────────────────────────────────────── */}
        <Section icon="user" title={t('settings.account')}>
          <SettingRow
            icon="edit-3"
            label={t('profile.edit_profile')}
            subLabel={t('profile.edit_profile_sub')}
            onPress={() => navigation.navigate('EditProfile' as never)}
          />
          <SettingRow
            icon="lock"
            label={t('settings.change_password')}
            subLabel={t('settings.change_password_sub')}
            onPress={() => navigation.navigate('ChangePassword' as never)}
            isLast
          />
        </Section>

        {/* ── Preferences ──────────────────────────────────────────── */}
        <Section icon="sliders" title={t('settings.preferences')}>
          <SettingRow
            icon="globe"
            label={t('settings.language')}
            subLabel={t('settings.language_sub')}
            badge={langBadge}
            onPress={() => navigation.navigate('Languages' as never)}
          />
          <SettingRow
            icon="sun"
            label={t('settings.theme')}
            subLabel={t('settings.theme_sub')}
            badge={themeBadge}
            onPress={() => navigation.navigate('Themes' as never)}
          />
          <SettingToggle
            icon="map-pin"
            label={t('settings.share_location')}
            subLabel={t('settings.share_location_sub')}
            value={locationSharing}
            onValueChange={() => dispatch(toggleLocationSharing())}
            isLast
          />
        </Section>

        {/* ── App Settings ─────────────────────────────────────────── */}
        <Section icon="settings" title={t('settings.app_settings')}>
          <SettingToggle
            icon="volume-2"
            label={t('settings.sound')}
            subLabel={t('settings.sound_sub')}
            value={soundEnabled}
            onValueChange={() => dispatch(toggleSound())}
          />
          <SettingToggle
            icon="smartphone"
            label={t('settings.vibration')}
            subLabel={t('settings.vibration_sub')}
            value={vibrationEnabled}
            onValueChange={() => dispatch(toggleVibration())}
            isLast
          />
        </Section>

        {/* ── Notifications ────────────────────────────────────────── */}
        <Section icon="bell" title={t('settings.notifications')}>
          <SettingToggle
            icon="bell"
            label={t('settings.app_notifications')}
            subLabel={t('settings.notifications_sub')}
            value={notificationsEnabled}
            onValueChange={() => dispatch(toggleNotifications())}
          />
          <SettingRow
            icon="sliders"
            label={t('settings.notification_settings')}
            subLabel={t('settings.notification_settings_sub')}
            onPress={() => navigation.navigate('NotificationSettings' as never)}
            isLast
          />
        </Section>

        {/* ── Support ──────────────────────────────────────────────── */}
        <Section icon="life-buoy" title={t('settings.support')}>
          <SettingRow
            icon="help-circle"
            label={t('settings.help_and_support')}
            subLabel={t('settings.help_sub')}
            onPress={() => navigation.navigate('HelpSupport' as never)}
          />
          <SettingRow
            icon="shield"
            label={t('settings.privacy_policy')}
            subLabel={t('settings.privacy_sub')}
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
            accessibilityLabel={t('settings.sign_out')}
          >
            <Feather name="log-out" size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>{t('settings.sign_out')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>MatchMate v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
