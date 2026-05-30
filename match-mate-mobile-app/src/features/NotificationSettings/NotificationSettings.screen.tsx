import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';
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
import { showConfirm } from '@/core/utils/confirm';
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
  const [update] = useUpdateNotificationSettingsMutation();
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
      void update({ [key]: value });
    },
    [update]
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

  const handleDisableAll = useCallback(() => {
    showConfirm({
      title: t('settings.notifications.disable_all_title'),
      message: t('settings.notifications.disable_all_message'),
      confirmText: t('settings.notifications.disable_all_confirm'),
      destructive: true,
      onConfirm: () => {
        void update({
          inAppEnabled: false,
          pushEnabled: false,
          emailEnabled: false,
          smsEnabled: false,
          marketingEnabled: false,
          doNotDisturb: true,
        });
      },
    });
  }, [update, t]);

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  const globalEnabled =
    settings?.inAppEnabled || settings?.pushEnabled || settings?.emailEnabled;

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.notifications.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Master card ───────────────────────────────────────────── */}
        <View style={masterStyles.card}>
          <View style={masterStyles.left}>
            <View
              style={[
                masterStyles.iconWrapper,
                { backgroundColor: theme.colors.white },
              ]}
            >
              <Feather name="bell" size={22} color={theme.colors.primary} />
            </View>
            <View>
              <Text
                style={[
                  masterStyles.label,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t('settings.notifications.all_notifications')}
              </Text>
              <Text
                style={[
                  masterStyles.sublabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t('settings.notifications.master_sublabel')}
              </Text>
            </View>
          </View>
          <Switch
            value={!settings?.doNotDisturb}
            onValueChange={(v) => handleGlobalToggle('doNotDisturb', !v)}
            trackColor={{
              false: theme.colors.switchTrackOff,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
            accessibilityLabel={t('settings.notifications.all_notifications')}
            accessibilityRole="switch"
            accessibilityState={{ checked: !settings?.doNotDisturb }}
          />
        </View>

        {/* ── Quick actions ─────────────────────────────────────────── */}
        <View
          style={[
            masterStyles.quickActions,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.divider,
            },
          ]}
        >
          <SettingsSelectItem
            icon="bell"
            label={t('settings.notifications.enable_all')}
            isLast={false}
            onPress={() => {
              void update({
                inAppEnabled: true,
                pushEnabled: true,
                doNotDisturb: false,
              });
            }}
          />
          <SettingsSelectItem
            icon="bell-off"
            label={t('settings.notifications.disable_all')}
            destructive
            isLast
            onPress={handleDisableAll}
          />
        </View>

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
              value={settings?.preferences?.[event.key] as ChannelPreference}
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
            value={settings?.quietHours?.start as string}
            disabled={!settings?.quietHours?.enabled}
            onPress={() => setActiveQuietField('start')}
          />
          <SettingsSelectItem
            icon="sunset"
            label={t('settings.notifications.quiet_end')}
            value={settings?.quietHours?.end as string}
            disabled={!settings?.quietHours?.enabled}
            onPress={() => setActiveQuietField('end')}
          />
          <SettingsSelectItem
            icon="clock"
            label={t('settings.notifications.timezone')}
            value={settings?.quietHours?.timezone as string}
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
        selectedValue={settings?.quietHours?.start as string}
        onSelect={(value) => handleQuietHoursChange('start', value)}
        onClose={() => setActiveQuietField(null)}
      />
      <SettingsOptionSheet
        visible={activeQuietField === 'end'}
        title={t('settings.notifications.quiet_end')}
        options={timeOptions}
        selectedValue={settings?.quietHours?.end as string}
        onSelect={(value) => handleQuietHoursChange('end', value)}
        onClose={() => setActiveQuietField(null)}
      />
      <SettingsOptionSheet
        visible={activeQuietField === 'timezone'}
        title={t('settings.notifications.timezone')}
        options={timezoneOptions}
        selectedValue={settings?.quietHours?.timezone as string}
        onSelect={(value) => handleQuietHoursChange('timezone', value)}
        onClose={() => setActiveQuietField(null)}
      />
    </SafeAreaView>
  );
}

// ─── Local styles (master card only) ─────────────────────────────────────────

const masterStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  sublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
