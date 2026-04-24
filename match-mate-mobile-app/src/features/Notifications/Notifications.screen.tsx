import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationStyles } from './Notifications.styles';

import { NotifSection } from './Notifications.types';
import { INITIAL_NOTIFICATIONS } from './Notifications.constants';
import { EmptyState } from './components/EmptyState';
import { NotifItem } from './components/NotifItem';

export default function NotificationsScreen({
  navigation,
}: any): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [sections, setSections] = useState<NotifSection[]>(
    INITIAL_NOTIFICATIONS
  );

  const unreadCount = sections
    .flatMap((s) => s.data)
    .filter((n) => n.unread).length;

  const markAllRead = useCallback((): void => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        data: section.data.map((n) => ({ ...n, unread: false })),
      }))
    );
  }, []);

  const markRead = useCallback((id: string): void => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        data: section.data.map((n) =>
          n.id === id ? { ...n, unread: false } : n
        ),
      }))
    );
  }, []);

  const allNotifs = sections.flatMap((s) => s.data);

  return (
    <SafeAreaView style={styles.safe}>
      {/* ✅ HEADER */}
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('notifications.title')}
        subtitle={
          unreadCount > 0
            ? t('notifications.unread_count', { count: unreadCount })
            : t('notifications.all_caught_up')
        }
        actions={
          unreadCount > 0
            ? [
                {
                  icon: 'check',
                  onPress: markAllRead,
                  accessibilityLabel: t('notifications.mark_all_read'),
                },
              ]
            : []
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {allNotifs.length === 0 ? (
          <EmptyState />
        ) : (
          sections.map((section) =>
            section.data.length === 0 ? null : (
              <View key={section.title} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrapper}>
                    <Feather
                      name={section.icon}
                      size={13}
                      color={theme.colors.primary}
                    />
                  </View>

                  <Text style={styles.sectionTitle}>
                    {t(`notifications.sections.${section.title}`)}
                  </Text>

                  {section.data.some((n) => n.unread) && (
                    <Text style={styles.sectionCount}>
                      {section.data.filter((n) => n.unread).length}
                    </Text>
                  )}
                </View>

                {section.data.map((item, index) => (
                  <NotifItem
                    key={item.id}
                    item={item}
                    isLast={index === section.data.length - 1}
                    onPress={markRead}
                  />
                ))}
              </View>
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
