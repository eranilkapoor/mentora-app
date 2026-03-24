import React, { useCallback, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import { Colors } from '../../constants/colors';
import {
  ParamlessScreen,
  type RootNavigationProp,
} from '../../navigation/types';

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

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);

  const navigateTo = useCallback(
    (screen: ParamlessScreen) => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  const handleSignOut = useCallback(() => {
    const confirmSignOut = (): void => {
      dispatch(logout());
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        confirmSignOut();
      }
      return;
    }

    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: confirmSignOut,
      },
    ]);
  }, [dispatch, navigation]);

  return (
    <SafeAreaProvider style={styles.safe}>
      <StatusBar
        barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingRow
            label="Edit Profile"
            onPress={() => navigateTo('EditProfile')}
          />
          <SettingRow
            label="Change Password"
            onPress={() => navigateTo('ChangePassword')}
          />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingToggle
            label="Dark Mode"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
          <SettingToggle
            label="Share Location"
            value={locationSharing}
            onValueChange={setLocationSharing}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingToggle
            label="App Notifications"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingRow
            label="Notification Settings"
            onPress={() => navigateTo('NotificationSettings')}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingRow
            label="Help & Support"
            onPress={() => navigateTo('HelpSupport')}
          />
          <SettingRow
            label="Privacy Policy"
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
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundPage,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  rowLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  signOutSection: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  signOutText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 16,
  },
});
