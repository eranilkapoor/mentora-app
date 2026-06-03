import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationStyles } from '../Notifications.styles';
import { Notification } from '../Notifications.types';

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
        <Feather
          name={item.icon}
          size={18}
          color={
            item.iconColor ??
            (item.unread ? theme.colors.primary : theme.colors.textMuted)
          }
        />
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
      </View>

      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}
