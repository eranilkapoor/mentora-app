import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { ChannelPreferenceRow } from '@/core/components/settings/ChannelPreferenceRow';
import {
  SettingsOption,
  SettingsOptionSheet,
} from '@/core/components/settings/SettingsOptionSheet';
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useUpdateNotificationChannelMutation,
} from '@/store/services/notificationSettingsApi.service';
import {
  ChannelPreference,
  NotificationSettings,
  NotificationSettingsScreenProps,
  QuietHours,
} from './NotificationSettings.types';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { showError } from '@/core/utils/toast';

// ─── Per-event notification config ───────────────────────────────────────────

type EventKey = keyof NotificationSettings['preferences'];
type QuietHoursKey = 'start' | 'end' | 'timezone';

interface EventConfig {
  key: EventKey;
  label: string;
  sublabel: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}

const NOTIFICATION_EVENTS: EventConfig[] = [
  {
    key: 'interestReceived',
    label: 'settings.notifications.interest_received',
    sublabel: 'settings.notifications.interest_received_sub',
    icon: 'heart',
  },
  {
    key: 'interestAccepted',
    label: 'settings.notifications.interest_accepted',
    sublabel: 'settings.notifications.interest_accepted_sub',
    icon: 'check-circle',
  },
  {
    key: 'matchFound',
    label: 'settings.notifications.match_found',
    sublabel: 'settings.notifications.match_found_sub',
    icon: 'star',
  },
  {
    key: 'profileView',
    label: 'settings.notifications.profile_view',
    sublabel: 'settings.notifications.profile_view_sub',
    icon: 'eye',
  },
  {
    key: 'messageReceived',
    label: 'settings.notifications.message_received',
    sublabel: 'settings.notifications.message_received_sub',
    icon: 'message-circle',
  },
  {
    key: 'subscription',
    label: 'settings.notifications.subscription',
    sublabel: 'settings.notifications.subscription_sub',
    icon: 'credit-card',
  },
  {
    key: 'system',
    label: 'settings.notifications.system',
    sublabel: 'settings.notifications.system_sub',
    icon: 'bell',
  },
  {
    key: 'marketing',
    label: 'settings.notifications.marketing',
    sublabel: 'settings.notifications.marketing_sub',
    icon: 'tag',
  },
];

export default function NotificationSettingsScreen({
  navigation,
}: NotificationSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { data, isLoading } = useGetNotificationSettingsQuery();
  const [update, { isLoading: isUpdating }] =
    useUpdateNotificationSettingsMutation();
  const [updateChannel] = useUpdateNotificationChannelMutation();
  const [activeQuietField, setActiveQuietField] =
    useState<QuietHoursKey | null>(null);

  const settings = data?.notification as NotificationSettings;

  const timeOptions = useMemo<SettingsOption<string>[]>(
    () =>
      Array.from({ length: 24 }, (_, hour) => {
        const value = `${hour.toString().padStart(2, '0')}:00`;
        return { value, label: value };
      }),
    []
  );

  const timezoneOptions = useMemo<SettingsOption<string>[]>(
    () => [
      { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'America/New_York' },
      { value: 'Europe/London', label: 'Europe/London' },
    ],
    []
  );

  // ─── Global toggle ────────────────────────────────────────────────────────

  const handleGlobalToggle = useCallback(
    (key: keyof NotificationSettings, value: boolean) => {
      const resumesNotifications =
        value &&
        [
          'inAppEnabled',
          'pushEnabled',
          'emailEnabled',
          'smsEnabled',
          'marketingEnabled',
        ].includes(key);
      void update({
        [key]: value,
        ...(resumesNotifications ? { doNotDisturb: false } : {}),
      });
    },
    [update]
  );

  const handleMasterToggle = useCallback(
    async (value: boolean) => {
      try {
        await update({
          inAppEnabled: value,
          pushEnabled: value,
          emailEnabled: value,
          smsEnabled: value,
          marketingEnabled: value,
          doNotDisturb: !value,
        }).unwrap();
      } catch {
        showError({
          title: t('common.error_title'),
          message: t('common.try_again'),
        });
      }
    },
    [t, update]
  );

  // ─── Per-event per-channel toggle ────────────────────────────────────────

  const handleChannelToggle = useCallback(
    (event: EventKey, channel: keyof ChannelPreference, value: boolean) => {
      void updateChannel({ event, channel, value });
    },
    [updateChannel]
  );

  const handleQuietHoursChange = useCallback(
    <K extends keyof QuietHours>(key: K, value: QuietHours[K]) => {
      void update({
        quietHours: {
          enabled: settings?.quietHours?.enabled ?? false,
          start: settings?.quietHours?.start ?? '22:00',
          end: settings?.quietHours?.end ?? '07:00',
          timezone: settings?.quietHours?.timezone ?? 'Asia/Kolkata',
          [key]: value,
        },
      });
    },
    [settings?.quietHours, update]
  );

  // ─── Disable all ─────────────────────────────────────────────────────────

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  const globalEnabled = Boolean(
    settings?.inAppEnabled ||
    settings?.pushEnabled ||
    settings?.emailEnabled ||
    settings?.smsEnabled ||
    settings?.marketingEnabled
  );

  const defaultChannelPreference: ChannelPreference = {
    inApp: false,
    push: false,
    email: false,
    sms: false,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.notification_settings.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Master card ───────────────────────────────────────────── */}
        <View style={styles.masterCard}>
          <View style={styles.masterLeft}>
            <View style={styles.masterIconWrapper}>
              <Feather name="bell" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.masterTextWrapper}>
              <Text style={styles.masterLabel}>
                {t('settings.notifications.all_notifications')}
              </Text>
              <Text style={styles.masterSublabel}>
                {t('settings.notifications.master_sublabel')}
              </Text>
            </View>
          </View>
          <Switch
            value={!settings?.doNotDisturb && Boolean(globalEnabled)}
            disabled={isUpdating}
            onValueChange={(value) => void handleMasterToggle(value)}
            trackColor={{
              false: theme.colors.switchTrackOff,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
            accessibilityLabel={t('settings.notifications.all_notifications')}
            accessibilityRole="switch"
            accessibilityState={{
              checked: !settings?.doNotDisturb && Boolean(globalEnabled),
            }}
          />
        </View>

        {/* ── Quick actions ─────────────────────────────────────────── */}
        {/* ── Global channel toggles ────────────────────────────────── */}
        <SettingsCard
          icon="sliders"
          title={t('settings.notifications.channels')}
          subtitle={t('settings.notifications.channels_subtitle')}
        >
          <SettingsToggleItem
            icon="bell"
            label={t('settings.notifications.in_app')}
            sublabel={t('settings.notifications.in_app_sub')}
            value={settings?.inAppEnabled ?? false}
            onChange={(v) => handleGlobalToggle('inAppEnabled', v)}
          />
          <SettingsToggleItem
            icon="smartphone"
            label={t('settings.notifications.push')}
            sublabel={t('settings.notifications.push_sub')}
            value={settings?.pushEnabled ?? false}
            onChange={(v) => handleGlobalToggle('pushEnabled', v)}
          />
          <SettingsToggleItem
            icon="mail"
            label={t('settings.notifications.email')}
            sublabel={t('settings.notifications.email_sub')}
            value={settings?.emailEnabled ?? false}
            onChange={(v) => handleGlobalToggle('emailEnabled', v)}
          />
          <SettingsToggleItem
            icon="message-square"
            label={t('settings.notifications.sms')}
            sublabel={t('settings.notifications.sms_sub')}
            value={settings?.smsEnabled ?? false}
            onChange={(v) => handleGlobalToggle('smsEnabled', v)}
          />
          <SettingsToggleItem
            icon="tag"
            label={t('settings.notifications.marketing')}
            sublabel={t('settings.notifications.marketing_global_sub')}
            value={settings?.marketingEnabled ?? false}
            isLast
            onChange={(v) => handleGlobalToggle('marketingEnabled', v)}
          />
        </SettingsCard>

        {/* ── Per-event channel preferences ─────────────────────────── */}
        <SettingsCard
          icon="settings"
          title={t('settings.notifications.per_event')}
          subtitle={t('settings.notifications.per_event_subtitle')}
        >
          {NOTIFICATION_EVENTS.map((event, index) => (
            <ChannelPreferenceRow
              key={event.key}
              label={t(event.label)}
              sublabel={t(event.sublabel)}
              value={
                settings?.preferences?.[event.key] ?? defaultChannelPreference
              }
              globalEnabled={globalEnabled}
              isLast={index === NOTIFICATION_EVENTS.length - 1}
              onChange={(channel, value) =>
                handleChannelToggle(event.key, channel, value)
              }
            />
          ))}
        </SettingsCard>

        {/* ── Device preferences ────────────────────────────────────── */}
        <SettingsCard
          icon="volume-2"
          title={t('settings.notifications.device')}
          subtitle={t('settings.notifications.device_subtitle')}
        >
          <SettingsToggleItem
            icon="volume-2"
            label={t('settings.notifications.sound')}
            sublabel={t('settings.notifications.sound_sub')}
            value={settings?.soundEnabled ?? false}
            onChange={(v) => handleGlobalToggle('soundEnabled', v)}
          />
          <SettingsToggleItem
            icon="zap"
            label={t('settings.notifications.vibration')}
            sublabel={t('settings.notifications.vibration_sub')}
            value={settings?.vibrationEnabled ?? false}
            isLast
            onChange={(v) => handleGlobalToggle('vibrationEnabled', v)}
          />
        </SettingsCard>

        {/* ── Quiet Hours ───────────────────────────────────────────── */}
        <SettingsCard
          icon="moon"
          title={t('settings.notifications.quiet_hours')}
          subtitle={t('settings.notifications.quiet_hours_subtitle')}
        >
          <SettingsToggleItem
            icon="moon"
            label={t('settings.notifications.quiet_hours_enabled')}
            sublabel={t('settings.notifications.quiet_hours_enabled_sub')}
            value={settings?.quietHours?.enabled ?? false}
            onChange={(v) =>
              void update({
                quietHours: { ...settings?.quietHours, enabled: v },
              })
            }
          />
          <SettingsSelectItem
            icon="sunrise"
            label={t('settings.notifications.quiet_start')}
            sublabel={t('settings.notifications.quiet_start_sub', {
              defaultValue: 'Notifications are silenced from this time.',
            })}
            value={settings?.quietHours?.start ?? '22:00'}
            disabled={!settings?.quietHours?.enabled}
            onPress={() => setActiveQuietField('start')}
          />
          <SettingsSelectItem
            icon="sunset"
            label={t('settings.notifications.quiet_end')}
            sublabel={t('settings.notifications.quiet_end_sub', {
              defaultValue: 'Notifications resume after this time.',
            })}
            value={settings?.quietHours?.end ?? '07:00'}
            disabled={!settings?.quietHours?.enabled}
            onPress={() => setActiveQuietField('end')}
          />
          <SettingsSelectItem
            icon="clock"
            label={t('settings.notifications.timezone')}
            sublabel={t('settings.notifications.timezone_sub', {
              defaultValue:
                'Quiet hours follow this timezone even when you travel.',
            })}
            value={settings?.quietHours?.timezone ?? 'UTC'}
            disabled={!settings?.quietHours?.enabled}
            isLast
            onPress={() => setActiveQuietField('timezone')}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>

      <SettingsOptionSheet
        visible={activeQuietField === 'start'}
        title={t('settings.notifications.quiet_start')}
        options={timeOptions}
        selectedValue={settings?.quietHours?.start ?? '22:00'}
        onSelect={(value) => handleQuietHoursChange('start', value)}
        onClose={() => setActiveQuietField(null)}
      />
      <SettingsOptionSheet
        visible={activeQuietField === 'end'}
        title={t('settings.notifications.quiet_end')}
        options={timeOptions}
        selectedValue={settings?.quietHours?.end ?? '07:00'}
        onSelect={(value) => handleQuietHoursChange('end', value)}
        onClose={() => setActiveQuietField(null)}
      />
      <SettingsOptionSheet
        visible={activeQuietField === 'timezone'}
        title={t('settings.notifications.timezone')}
        options={timezoneOptions}
        selectedValue={settings?.quietHours?.timezone ?? 'UTC'}
        onSelect={(value) => handleQuietHoursChange('timezone', value)}
        onClose={() => setActiveQuietField(null)}
      />
    </SafeAreaView>
  );
}
