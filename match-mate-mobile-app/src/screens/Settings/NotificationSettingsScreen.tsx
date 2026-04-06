import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../core/constants/colors';
import { type RootNavigationProp } from '../../navigation/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationSettingsStyles } from './NotificationSettingsScreen.styles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationSettingsScreenProps {
  navigation: RootNavigationProp;
}

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  icon: string;
}

interface NotificationGroup {
  title: string;
  subtitle: string;
  settings: NotificationSetting[];
}

type NotificationState = Record<string, boolean>;

interface ToggleRowProps {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    title: 'Matches & Interests',
    subtitle: 'Stay updated on your match activity',
    settings: [
      {
        key: 'newMatches',
        label: 'New Matches',
        description: 'When someone matches your preferences',
        icon: 'heart',
      },
      {
        key: 'interestReceived',
        label: 'Interest Received',
        description: 'When someone sends you an interest',
        icon: 'star',
      },
      {
        key: 'interestAccepted',
        label: 'Interest Accepted',
        description: 'When your interest is accepted',
        icon: 'check-circle',
      },
      {
        key: 'profileShortlisted',
        label: 'Profile Shortlisted',
        description: 'When someone shortlists your profile',
        icon: 'bookmark',
      },
      {
        key: 'profileViewed',
        label: 'Profile Viewed',
        description: 'When someone views your profile',
        icon: 'eye',
      },
    ],
  },
  {
    title: 'Messages & Chat',
    subtitle: 'Notifications for your conversations',
    settings: [
      {
        key: 'newMessages',
        label: 'New Messages',
        description: 'When you receive a new chat message',
        icon: 'message-circle',
      },
      {
        key: 'messageRequests',
        label: 'Message Requests',
        description: 'When someone requests to chat',
        icon: 'mail',
      },
    ],
  },
  {
    title: 'Account & Security',
    subtitle: 'Important updates about your account',
    settings: [
      {
        key: 'profileApproval',
        label: 'Profile Approval',
        description: 'Status updates on your profile review',
        icon: 'shield',
      },
      {
        key: 'verificationUpdates',
        label: 'Verification Updates',
        description: 'Updates on ID or photo verification',
        icon: 'award',
      },
      {
        key: 'loginAlerts',
        label: 'Login Alerts',
        description: 'Alerts for new device sign-ins',
        icon: 'log-in',
      },
      {
        key: 'passwordChanges',
        label: 'Password Changes',
        description: 'When your password is updated',
        icon: 'lock',
      },
    ],
  },
  {
    title: 'Subscription & Offers',
    subtitle: 'Plan updates and special deals',
    settings: [
      {
        key: 'premiumOffers',
        label: 'Premium Offers',
        description: 'Discounts and upgrade promotions',
        icon: 'tag',
      },
      {
        key: 'planExpiry',
        label: 'Plan Expiry Reminders',
        description: 'Reminders before your plan expires',
        icon: 'clock',
      },
      {
        key: 'paymentUpdates',
        label: 'Payment Updates',
        description: 'Receipts and billing notifications',
        icon: 'credit-card',
      },
    ],
  },
  {
    title: 'Reminders & Tips',
    subtitle: 'Helpful nudges to improve your experience',
    settings: [
      {
        key: 'profileCompletion',
        label: 'Profile Completion',
        description: 'Tips to improve your profile score',
        icon: 'user',
      },
      {
        key: 'dailyMatches',
        label: 'Daily Match Digest',
        description: 'A daily summary of recommended profiles',
        icon: 'sun',
      },
      {
        key: 'inactivityReminders',
        label: 'Inactivity Reminders',
        description: "Reminders when you haven't logged in",
        icon: 'bell',
      },
    ],
  },
];

const buildInitialState = (): NotificationState => {
  const state: NotificationState = { masterToggle: true };
  for (const group of NOTIFICATION_GROUPS) {
    for (const setting of group.settings) {
      state[setting.key] = true;
    }
  }
  return state;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: ToggleRowProps): React.ReactElement {
  const styles = useThemedStyles(notificationSettingsStyles);

  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.rowIconWrapper}>
        <Feather
          name={icon}
          size={16}
          color={disabled ? Colors.textMuted : Colors.primary}
        />
      </View>
      <View style={styles.rowTextWrapper}>
        <Text style={[styles.rowLabel, disabled && styles.textDisabled]}>
          {label}
        </Text>
        <Text style={[styles.rowDescription, disabled && styles.textDisabled]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.switchTrackOff, true: Colors.primary }}
        thumbColor={Colors.white}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
      />
    </View>
  );
}

function SectionCard({
  group,
  settings,
  onToggle,
  masterEnabled,
}: {
  group: NotificationGroup;
  settings: NotificationState;
  onToggle: (key: string, val: boolean) => void;
  masterEnabled: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(notificationSettingsStyles);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>{group.title}</Text>
        <Text style={styles.sectionSubtitle}>{group.subtitle}</Text>
      </View>
      {group.settings.map((setting, index) => (
        <View key={setting.key}>
          {index > 0 && <View style={styles.rowDivider} />}
          <ToggleRow
            icon={setting.icon}
            label={setting.label}
            description={setting.description}
            value={settings[setting.key] ?? true}
            onValueChange={(val) => onToggle(setting.key, val)}
            disabled={!masterEnabled}
          />
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function NotificationSettingsScreen({}: NotificationSettingsScreenProps): React.ReactElement {
  const [settings, setSettings] =
    useState<NotificationState>(buildInitialState);
  const styles = useThemedStyles(notificationSettingsStyles);

  const masterEnabled = settings['masterToggle'] ?? true;

  const handleToggle = useCallback((key: string, value: boolean): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleMasterToggle = useCallback((value: boolean): void => {
    setSettings((prev) => {
      const updated: NotificationState = { ...prev, masterToggle: value };
      if (!value) {
        for (const group of NOTIFICATION_GROUPS) {
          for (const setting of group.settings) {
            updated[setting.key] = false;
          }
        }
      }
      return updated;
    });
  }, []);

  const handleEnableAll = useCallback((): void => {
    setSettings(() => {
      const updated: NotificationState = { masterToggle: true };
      for (const group of NOTIFICATION_GROUPS) {
        for (const setting of group.settings) {
          updated[setting.key] = true;
        }
      }
      return updated;
    });
  }, []);

  const handleDisableAll = useCallback((): void => {
    Alert.alert(
      'Disable All Notifications',
      'Are you sure you want to turn off all notifications? You may miss important match and message updates.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable All',
          style: 'destructive',
          onPress: () => {
            setSettings(() => {
              const updated: NotificationState = { masterToggle: false };
              for (const group of NOTIFICATION_GROUPS) {
                for (const setting of group.settings) {
                  updated[setting.key] = false;
                }
              }
              return updated;
            });
          },
        },
      ]
    );
  }, []);

  const enabledCount = Object.entries(settings).filter(
    ([key, val]) => key !== 'masterToggle' && val
  ).length;

  const totalCount = NOTIFICATION_GROUPS.reduce(
    (acc, g) => acc + g.settings.length,
    0
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: Colors.backgroundPage }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle Card */}
        <View style={styles.masterCard}>
          <View style={styles.masterLeft}>
            <View style={styles.masterIconWrapper}>
              <Feather name="bell" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.masterLabel}>All Notifications</Text>
              <Text style={styles.masterSubtitle}>
                {enabledCount} of {totalCount} enabled
              </Text>
            </View>
          </View>
          <Switch
            value={masterEnabled}
            onValueChange={handleMasterToggle}
            trackColor={{ false: Colors.switchTrackOff, true: Colors.primary }}
            thumbColor={Colors.white}
            accessibilityLabel="Toggle all notifications"
            accessibilityRole="switch"
            accessibilityState={{ checked: masterEnabled }}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={handleEnableAll}
            accessibilityRole="button"
          >
            <Feather name="bell" size={14} color={Colors.primary} />
            <Text style={styles.quickActionText}>Enable All</Text>
          </TouchableOpacity>
          <View style={styles.quickActionDivider} />
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={handleDisableAll}
            accessibilityRole="button"
          >
            <Feather name="bell-off" size={14} color={Colors.danger} />
            <Text
              style={[styles.quickActionText, styles.quickActionTextDanger]}
            >
              Disable All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notification Groups */}
        {NOTIFICATION_GROUPS.map((group) => (
          <SectionCard
            key={group.title}
            group={group}
            settings={settings}
            onToggle={handleToggle}
            masterEnabled={masterEnabled}
          />
        ))}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
