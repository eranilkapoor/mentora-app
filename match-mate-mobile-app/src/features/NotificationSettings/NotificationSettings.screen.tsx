import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { notificationSettingsStyles } from './NotificationSettings.styles';
import {
  NotificationSettingsScreenProps,
  NotificationState,
} from './NotificationSettings.types';
import { NOTIFICATION_GROUPS } from './NotificationSettings.constants';
import { SectionCard } from './components/SectionCard';
import Header from '@/core/components/Header';
import { showConfirm } from '@/core/utils/confirm';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildInitialState = (): NotificationState => {
  const state: NotificationState = { masterToggle: true };
  for (const group of NOTIFICATION_GROUPS) {
    for (const setting of group.settings) {
      state[setting.key] = true;
    }
  }
  return state;
};

const TOTAL_COUNT = NOTIFICATION_GROUPS.reduce(
  (acc, g) => acc + g.settings.length,
  0
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationSettingsScreen({
  navigation,
}: NotificationSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(notificationSettingsStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [settings, setSettings] =
    useState<NotificationState>(buildInitialState);

  const masterEnabled = settings['masterToggle'] ?? true;

  const enabledCount = Object.entries(settings).filter(
    ([key, val]) => key !== 'masterToggle' && val
  ).length;

  // ─── Handlers ─────────────────────────────────────────────────────────────

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
    setSettings(() => buildInitialState());
  }, []);

  const handleDisableAll = useCallback((): void => {
    showConfirm({
      title: t('settings.notification_settings.disable_all'),
      message: t('settings.notification_settings.disable_all_confirm'),
      confirmText: t('settings.notification_settings.disable_all'),
      destructive: true,
      onConfirm: () => {
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
    });
  }, [t]);

  // ─── Render ───────────────────────────────────────────────────────────────

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
        {/* ── Master toggle card ─────────────────────────────────────── */}
        <View style={styles.masterCard}>
          <View style={styles.masterLeft}>
            <View style={styles.masterIconWrapper}>
              <Feather name="bell" size={22} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.masterLabel}>
                {t('settings.notification_settings.all_notifications')}
              </Text>
              <Text style={styles.masterSubtitle}>
                {t('settings.notification_settings.enabled_count', {
                  count: enabledCount,
                  total: TOTAL_COUNT,
                })}
              </Text>
            </View>
          </View>

          <Switch
            value={masterEnabled}
            onValueChange={handleMasterToggle}
            trackColor={{
              false: theme.colors.switchTrackOff,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
            accessibilityLabel={t(
              'settings.notification_settings.all_notifications'
            )}
            accessibilityRole="switch"
            accessibilityState={{ checked: masterEnabled }}
          />
        </View>

        {/* ── Quick actions ──────────────────────────────────────────── */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={handleEnableAll}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('settings.notification_settings.enable_all')}
          >
            <Feather name="bell" size={14} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>
              {t('settings.notification_settings.enable_all')}
            </Text>
          </TouchableOpacity>

          <View style={styles.quickActionDivider} />

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={handleDisableAll}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('settings.notification_settings.disable_all')}
          >
            <Feather name="bell-off" size={14} color={theme.colors.danger} />
            <Text
              style={[styles.quickActionText, styles.quickActionTextDanger]}
            >
              {t('settings.notification_settings.disable_all')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Notification groups ────────────────────────────────────── */}
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
