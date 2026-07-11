import React, { useMemo } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { HomeNavigationProp, HomeStackParamList } from '@/navigation/types';
import { notificationStyles } from './Notifications.styles';
import { navigateFromNotificationAction } from './notificationNavigation';
import { resolveApiUrl } from '@/core/utils/config';

type Props = {
  navigation: HomeNavigationProp;
  route: RouteProp<HomeStackParamList, 'NotificationDetail'>;
};

const formatDateTime = (value?: string): string => {
  if (!value) return '';

  return new Date(value).toLocaleString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const actionLabelKeyByScreen: Record<string, string> = {
  ChatDetails: 'notifications.detail.open_chat',
  MatchDetails: 'notifications.detail.view_profile',
  Matches: 'notifications.detail.view_matches',
  Notifications: 'notifications.detail.view_notifications',
};

export default function NotificationDetailScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const notification = route.params;
  const actorImage = notification.actorImage
    ? resolveApiUrl(notification.actorImage)
    : undefined;

  const formattedDate = useMemo(
    () => formatDateTime(notification.createdAt),
    [notification.createdAt]
  );

  const actionLabel = notification.action?.screen
    ? t(
        actionLabelKeyByScreen[notification.action.screen] ??
          'notifications.detail.open_related'
      )
    : undefined;
  const readStateLabel = notification.unread
    ? t('notifications.detail.unread_title')
    : t('notifications.detail.read_title');
  const readStateDescription = notification.unread
    ? t('notifications.detail.unread_description')
    : t('notifications.detail.read_description');

  const handleAction = (): void => {
    const didNavigate = navigateFromNotificationAction(notification.action, {
      ...(notification.actorId ? { actorId: notification.actorId } : {}),
      title: notification.actorName ?? notification.title,
      ...(notification.actorImage ? { image: notification.actorImage } : {}),
    });

    if (!didNavigate) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('notifications.detail.title')}
        subtitle={formattedDate || notification.time}
      />

      <ScrollView
        contentContainerStyle={styles.detailScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailIconWrapper}>
              {actorImage ? (
                <Image
                  source={{ uri: actorImage }}
                  style={styles.detailActorImage}
                />
              ) : (
                <Feather
                  name={notification.icon}
                  size={24}
                  color={notification.iconColor ?? theme.colors.primary}
                />
              )}
            </View>

            <View style={styles.detailHeaderText}>
              <Text style={styles.detailCategory}>
                {t(`notifications.categories.${notification.category}`, {
                  defaultValue: notification.category.replace(/_/g, ' '),
                })}
              </Text>
              <Text style={styles.detailTitle}>{notification.title}</Text>
            </View>
          </View>

          <View
            style={[
              styles.detailStateBanner,
              notification.unread && styles.detailStateBannerUnread,
            ]}
          >
            <View
              style={[
                styles.detailStateIcon,
                notification.unread && styles.detailStateIconUnread,
              ]}
            >
              <Feather
                name={notification.unread ? 'circle' : 'check-circle'}
                size={16}
                color={
                  notification.unread
                    ? theme.colors.primary
                    : theme.colors.success
                }
              />
            </View>
            <View style={styles.detailStateText}>
              <Text style={styles.detailStateTitle}>{readStateLabel}</Text>
              <Text style={styles.detailStateDescription}>
                {readStateDescription}
              </Text>
            </View>
          </View>

          <Text style={styles.detailMessage}>{notification.message}</Text>

          <View style={styles.detailMetaList}>
            <View style={styles.detailMetaRow}>
              <Text style={styles.detailMetaLabel}>
                {t('notifications.detail.received')}
              </Text>
              <Text style={styles.detailMetaValue}>
                {formattedDate || notification.time}
              </Text>
            </View>

            {notification.actorName ? (
              <View style={styles.detailMetaRow}>
                <Text style={styles.detailMetaLabel}>
                  {t('notifications.detail.from')}
                </Text>
                <Text style={styles.detailMetaValue}>
                  {notification.actorName}
                </Text>
              </View>
            ) : null}

            {notification.type ? (
              <View style={styles.detailMetaRow}>
                <Text style={styles.detailMetaLabel}>
                  {t('notifications.detail.kind')}
                </Text>
                <Text style={styles.detailMetaValue}>
                  {t(`notifications.detail.kinds.${notification.type}`, {
                    defaultValue: notification.type.replace(/_/g, ' '),
                  })}
                </Text>
              </View>
            ) : null}
          </View>

          {actionLabel ? (
            <TouchableOpacity
              style={styles.detailActionButton}
              onPress={handleAction}
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              activeOpacity={0.86}
            >
              <Text style={styles.detailActionText}>{actionLabel}</Text>
              <Feather
                name="arrow-right"
                size={16}
                color={theme.colors.textInverse}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
