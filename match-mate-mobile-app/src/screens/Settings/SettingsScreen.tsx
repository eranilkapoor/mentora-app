import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../core/constants/colors';
import {
  ParamlessScreen,
  type RootNavigationProp,
} from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
  toggleNotifications,
  toggleSound,
  toggleLocationSharing,
  toggleVibration,
} from '../../store/slices/settingsSlice';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/theme/ThemeProvider';
import { settingsStyles } from './SettingsScreen.styles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsScreenProps {
  navigation: RootNavigationProp;
}

interface SettingRowProps {
  label: string;
  onPress: () => void;
}

interface SettingToggleProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SettingRow({ label, onPress }: SettingRowProps): React.ReactElement {
  const styles = settingsStyles(useTheme().theme);
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Feather name="chevron-right" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

function SettingToggle({
  label,
  value,
  onValueChange,
}: SettingToggleProps): React.ReactElement {
  const styles = settingsStyles(useTheme().theme);
  return (
    <View style={styles.row} accessibilityRole="none">
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.switchTrackOff, true: Colors.primary }}
        thumbColor={Colors.white}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen({
  navigation,
}: SettingsScreenProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = settingsStyles(theme);

  const themeMode = useAppSelector((state) => state.settings.theme);
  const language = useAppSelector((state) => state.settings.language);
  const locationSharing = useAppSelector(
    (state) => state.settings.locationSharing
  );
  const soundEnabled = useAppSelector((state) => state.settings.soundEnabled);
  const vibrationEnabled = useAppSelector(
    (state) => state.settings.vibrationEnabled
  );
  const notificationsEnabled = useAppSelector(
    (state) => state.settings.notificationsEnabled
  );

  const navigateTo = useCallback(
    (screen: ParamlessScreen) => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  const handleSignOut = useCallback(() => {
    const confirmSignOut = async (): Promise<void> => {
      void dispatch(logout()); // ✅ FIX: dispatch the logout action
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        void confirmSignOut(); // ✅ FIX
      }
      return;
    }

    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => void confirmSignOut(), // ✅ FIX: call the confirmSignOut function
      },
    ]);
  }, [dispatch]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.backgroundPage }]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account')}</Text>
          <SettingRow
            label={t('edit_profile')}
            onPress={() => navigateTo('EditProfile')}
          />
          <SettingRow
            label={t('change_password')}
            onPress={() => navigateTo('ChangePassword')}
          />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('preferences')}</Text>
          <SettingRow
            label={`${t('language')} (${language === 'en' ? t('english') : t('hindi')})`}
            onPress={() => navigateTo('Languages')}
          />

          <SettingRow
            label={`${t('theme')} (${themeMode === 'light' ? t('light') : themeMode === 'dark' ? t('dark') : t('system')})`}
            onPress={() => navigateTo('Themes')}
          />

          <SettingToggle
            label={t('share_location')}
            value={locationSharing}
            onValueChange={() => dispatch(toggleLocationSharing())}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('app_settings')}</Text>
          <SettingToggle
            label={t('sound')}
            value={soundEnabled}
            onValueChange={() => dispatch(toggleSound())}
          />

          <SettingToggle
            label={t('vibration')}
            value={vibrationEnabled}
            onValueChange={() => dispatch(toggleVibration())}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications')}</Text>
          <SettingToggle
            label={t('app_notifications')}
            value={notificationsEnabled}
            onValueChange={() => dispatch(toggleNotifications())}
          />

          <SettingRow
            label={t('notification_settings')}
            onPress={() => navigateTo('NotificationSettings')}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('support')}</Text>
          <SettingRow
            label={t('help_and_support')}
            onPress={() => navigateTo('HelpSupport')}
          />

          <SettingRow
            label={t('privacy_policy')}
            onPress={() => navigateTo('PrivacyPolicy')}
          />
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out of your account"
          >
            <Feather name="log-out" size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>{t('sign_out')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
