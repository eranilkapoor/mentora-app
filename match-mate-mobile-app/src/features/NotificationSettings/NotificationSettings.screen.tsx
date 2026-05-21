import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../core/constants/colors';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationSettingsStyles } from './NotificationSettings.styles';
import {
  NotificationSettingsScreenProps,
  NotificationState,
} from './NotificationSettings.types';
import { NOTIFICATION_GROUPS } from './NotificationSettings.constants';
import { SectionCard } from './components/SectionCard';
import Header from '@/core/components/Header';
import { showConfirm } from '@/core/utils/confirm';

const buildInitialState = (): NotificationState => {
  const state: NotificationState = { masterToggle: true };
  for (const group of NOTIFICATION_GROUPS) {
    for (const setting of group.settings) {
      state[setting.key] = true;
    }
  }
  return state;
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function NotificationSettingsScreen({
  navigation,
}: NotificationSettingsScreenProps): React.ReactElement {
  const [settings, setSettings] =
    useState<NotificationState>(buildInitialState);
  const styles = useThemedStyles(notificationSettingsStyles);
  const { t } = useTranslation();

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
    showConfirm({
      title: t('settings.disable_all'),
      message: t('settings.disable_all_confirm'),
      confirmText: t('settings.disable_all'),
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
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.notification_settings')}
      />
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
