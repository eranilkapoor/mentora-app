import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  AppNotification,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/store/services/notificationApi.service';
import { notificationStyles } from './Notifications.styles';
import {
  notificationColorByType,
  notificationIconByCategory,
} from './Notifications.constants';
import {
  Notification,
  NotifSection,
  NotificationsScreenProps,
} from './Notifications.types';
import { EmptyState } from './components/EmptyState';
import { NotifItem } from './components/NotifItem';
import { navigateFromNotificationAction } from './notificationNavigation';

const getNotificationId = (item: AppNotification): string =>
  String(item._id ?? item.referenceId ?? item.createdAt ?? item.title);

const formatRelativeTime = (iso: string | undefined): string => {
  if (!iso) return '';

  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
  });
};

const getSectionKey = (
  iso: string | undefined
): 'today' | 'yesterday' | 'earlier' => {
  if (!iso) return 'earlier';

  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'today';
  if (date.toDateString() === yesterday.toDateString()) return 'yesterday';
  return 'earlier';
};

const sectionIconMap: Record<NotifSection['title'], string> = {
  today: 'zap',
  yesterday: 'clock',
  earlier: 'archive',
};

export default function NotificationsScreen({
  navigation,
}: NotificationsScreenProps): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery({ page: 1, limit: 50 });
  const { data: unreadData, refetch: refetchUnread } =
    useGetUnreadNotificationCountQuery();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const notifications = useMemo<Notification[]>(
    () =>
      (data?.success ? data.data.items : []).map((item) => ({
        id: getNotificationId(item),
        title: item.title,
        message: item.message,
        time: formatRelativeTime(item.createdAt),
        ...(item.createdAt ? { createdAt: item.createdAt } : {}),
        unread: !item.isRead,
        icon: notificationIconByCategory[item.category],
        iconColor: notificationColorByType(theme, item.type),
        type: item.type,
        category: item.category,
        ...(item.actorId ? { actorId: item.actorId } : {}),
        ...(item.actorName ? { actorName: item.actorName } : {}),
        ...(item.actorImage ? { actorImage: item.actorImage } : {}),
        ...(item.action ? { action: item.action } : {}),
        ...(item.metadata ? { metadata: item.metadata } : {}),
      })),
    [data, theme]
  );

  const sections = useMemo<NotifSection[]>(() => {
    const grouped: Record<NotifSection['title'], Notification[]> = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    for (const item of data?.success ? data.data.items : []) {
      const mapped = notifications.find(
        (notification) => notification.id === getNotificationId(item)
      );
      if (mapped) {
        grouped[getSectionKey(item.createdAt)].push(mapped);
      }
    }

    return (['today', 'yesterday', 'earlier'] as const)
      .map((title) => ({
        title,
        icon: sectionIconMap[title],
        data: grouped[title],
      }))
      .filter((section) => section.data.length > 0);
  }, [data, notifications]);

  const unreadCount =
    unreadData?.success && unreadData.data
      ? unreadData.data.unreadCount
      : notifications.filter((item) => item.unread).length;

  const refresh = useCallback((): void => {
    void refetchNotifications();
    void refetchUnread();
  }, [refetchNotifications, refetchUnread]);

  const markAllRead = useCallback(async (): Promise<void> => {
    await markAllNotificationsRead().unwrap();
  }, [markAllNotificationsRead]);

  const markRead = useCallback(
    async (item: Notification): Promise<void> => {
      if (item?.unread) {
        await markNotificationRead({ id: item.id }).unwrap();
      }

      const didNavigate = navigateFromNotificationAction(item.action, {
        ...(item.actorId ? { actorId: item.actorId } : {}),
        title: item.actorName ?? item.title,
        ...(item.actorImage ? { image: item.actorImage } : {}),
      });

      if (!didNavigate) {
        navigation.navigate('NotificationDetail', item);
      }
    },
    [markNotificationRead, navigation]
  );

  return (
    <SafeAreaView style={styles.safe}>
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
                  onPress: () => {
                    void markAllRead();
                  },
                  accessibilityLabel: t('notifications.mark_all_read'),
                },
              ]
            : []
        }
      />

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t('notifications.loading')}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching || isMarkingAll}
              onRefresh={refresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {notifications.length === 0 ? (
            <EmptyState />
          ) : (
            sections.map((section) => (
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

                  {section.data.some((item) => item.unread) && (
                    <Text style={styles.sectionCount}>
                      {section.data.filter((item) => item.unread).length}
                    </Text>
                  )}
                </View>

                {section.data.map((item, index) => (
                  <NotifItem
                    key={item.id}
                    item={item}
                    isLast={index === section.data.length - 1}
                    onPress={(notification) => {
                      void markRead(notification);
                    }}
                  />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
