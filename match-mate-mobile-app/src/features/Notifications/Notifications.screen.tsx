import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
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
const PAGE_SIZE = 20;

export default function NotificationsScreen({
  navigation,
}: NotificationsScreenProps): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [notificationPages, setNotificationPages] = React.useState<
    AppNotification[]
  >([]);

  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery({ page, limit: PAGE_SIZE });
  const { data: unreadData, refetch: refetchUnread } =
    useGetUnreadNotificationCountQuery();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  React.useEffect(() => {
    if (!data?.success) return;

    setNotificationPages((prev) => {
      const next = page === 1 ? [] : [...prev];

      data.data.items.forEach((item) => {
        const existingIndex = next.findIndex(
          (entry) => getNotificationId(entry) === getNotificationId(item)
        );

        if (existingIndex >= 0) {
          next[existingIndex] = item;
        } else {
          next.push(item);
        }
      });

      return next;
    });
  }, [data, page]);

  const notifications = useMemo<Notification[]>(
    () =>
      notificationPages.map((item) => ({
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
    [notificationPages, theme]
  );

  const sections = useMemo<NotifSection[]>(() => {
    const grouped: Record<NotifSection['title'], Notification[]> = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    for (const item of notificationPages) {
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
  }, [notificationPages, notifications]);

  const unreadCount =
    unreadData?.success && unreadData.data
      ? unreadData.data.unreadCount
      : notifications.filter((item) => item.unread).length;

  const refresh = useCallback((): void => {
    setNotificationPages([]);
    setPage(1);
    void refetchNotifications();
    void refetchUnread();
  }, [refetchNotifications, refetchUnread]);

  const markAllRead = useCallback(async (): Promise<void> => {
    await markAllNotificationsRead().unwrap();
    setNotificationPages([]);
    setPage(1);
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

  const hasMore = Boolean(data?.success && data.data.hasNextPage);

  const loadMore = useCallback((): void => {
    if (!hasMore || isFetching) return;
    setPage((value) => value + 1);
  }, [hasMore, isFetching]);

  const renderSection: ListRenderItem<NotifSection> = useCallback(
    ({ item: section }) => (
      <View style={styles.sectionCard}>
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
    ),
    [markRead, styles, t, theme.colors.primary]
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
        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          renderItem={renderSection}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={isFetching || isMarkingAll}
              onRefresh={refresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            notifications.length === 0 ? <EmptyState /> : null
          }
          ListFooterComponent={
            isFetching && page > 1 ? (
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
