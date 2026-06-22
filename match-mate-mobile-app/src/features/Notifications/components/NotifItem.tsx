import React from 'react';
import { Image, TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationStyles } from '../Notifications.styles';
import { Notification } from '../Notifications.types';
import { resolveApiUrl } from '@/core/utils/config';

export function NotifItem({
  item,
  isLast,
  onPress,
}: {
  item: Notification;
  isLast: boolean;
  onPress: (item: Notification) => void;
}): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  const { theme } = useTheme();
  const actorImage = item.actorImage
    ? resolveApiUrl(item.actorImage)
    : undefined;

  return (
    <TouchableOpacity
      style={[
        styles.notifItem,
        isLast && styles.notifItemLast,
        item.unread && styles.notifItemUnread,
      ]}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View
        style={[
          styles.notifIconWrapper,
          item.unread && styles.notifIconWrapperUnread,
        ]}
      >
        {actorImage ? (
          <Image source={{ uri: actorImage }} style={styles.notifActorImage} />
        ) : (
          <Feather
            name={item.icon}
            size={18}
            color={
              item.iconColor ??
              (item.unread ? theme.colors.primary : theme.colors.textMuted)
            }
          />
        )}
      </View>

      <View style={styles.notifContent}>
        <View style={styles.notifTitleRow}>
          <Text
            style={[styles.notifTitle, item.unread && styles.notifTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>

        <Text style={styles.notifMessage} numberOfLines={2}>
          {item.message}
        </Text>

        <Text style={styles.notifCategory} numberOfLines={1}>
          {item.category.replace(/_/g, ' ')}
        </Text>
      </View>

      {item.action ? (
        <Feather
          name="chevron-right"
          size={16}
          color={theme.colors.textMuted}
        />
      ) : item.unread ? (
        <View style={styles.unreadDot} />
      ) : null}
    </TouchableOpacity>
  );
}
