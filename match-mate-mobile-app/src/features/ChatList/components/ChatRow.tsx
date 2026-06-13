import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { ChatMatch, formatTime } from '../ChatList.types';
import { chatListStyles } from '../ChatList.styles';
import {
  GestureResponderEvent,
  Image,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';

export function ChatRow({
  item,
  isTyping,
  isOwnLastMessage,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onAcceptRequest,
  onRejectRequest,
  onPress,
}: {
  item: ChatMatch;
  isTyping?: boolean;
  isOwnLastMessage?: boolean;
  onTogglePin?: () => void;
  onToggleMute?: () => void;
  onToggleArchive?: () => void;
  onAcceptRequest?: () => void;
  onRejectRequest?: () => void;
  onPress: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(chatListStyles);
  const { theme } = useTheme();
  const statusColor =
    item.lastMessageStatus === 'read'
      ? theme.colors.success
      : theme.colors.textMuted;
  const stopRowPress = (
    event: GestureResponderEvent,
    action?: () => void
  ): void => {
    event.stopPropagation();
    action?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        item.unreadCount > 0 && styles.cardUnread,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      accessibilityLabel={`Chat with ${item.name}`}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: item.avatarUrl }}
          style={[styles.avatar, item.unreadCount > 0 && styles.avatarUnread]}
        />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text
            style={[styles.name, item.unreadCount > 0 && styles.nameUnread]}
            numberOfLines={1}
          >
            {item.name}
            {item.age > 0 ? `, ${item.age}` : ''}
          </Text>
          {item.isPinned ? (
            <Feather name="star" size={12} color={theme.colors.primary} />
          ) : null}
          {item.isMuted ? (
            <Feather name="bell-off" size={12} color={theme.colors.textMuted} />
          ) : null}
          <Text
            style={[styles.time, item.unreadCount > 0 && styles.timeUnread]}
          >
            {formatTime(item.matchedAt)}
          </Text>
        </View>

        <View style={styles.cityRow}>
          <Feather name="map-pin" size={11} color={theme.colors.textMuted} />
          <Text style={styles.city}>{item.city}</Text>
        </View>

        <View style={styles.bottomRow}>
          {isOwnLastMessage && item.lastMessageStatus ? (
            <View style={styles.lastStatusWrap}>
              <Feather name="check" size={12} color={statusColor} />
              {item.lastMessageStatus !== 'sent' ? (
                <Feather
                  name="check"
                  size={12}
                  color={statusColor}
                  style={styles.lastStatusSecondTick}
                />
              ) : null}
            </View>
          ) : null}
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.lastMessageUnread,
              isTyping && styles.typingText,
            ]}
            numberOfLines={1}
          >
            {isTyping
              ? 'Typing...'
              : item.lastMessage || 'Start a conversation...'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        {item.isRequestIncoming ? (
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={styles.requestAcceptBtn}
              onPress={(event) => stopRowPress(event, onAcceptRequest)}
              accessibilityRole="button"
              accessibilityLabel="Accept chat request"
            >
              <Feather name="check" size={13} color={theme.colors.white} />
              <Text style={styles.requestAcceptText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.requestRejectBtn}
              onPress={(event) => stopRowPress(event, onRejectRequest)}
              accessibilityRole="button"
              accessibilityLabel="Reject chat request"
            >
              <Feather name="x" size={13} color={theme.colors.error} />
              <Text style={styles.requestRejectText}>Reject</Text>
            </TouchableOpacity>
          </View>
        ) : item.isRequestOutgoing ? (
          <View style={styles.requestPendingPill}>
            <Feather name="clock" size={12} color={theme.colors.textMuted} />
            <Text style={styles.requestPendingText}>Request pending</Text>
          </View>
        ) : (
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.quickActionBtn,
                item.isPinned && styles.quickActionBtnActive,
              ]}
              onPress={(event) => stopRowPress(event, onTogglePin)}
              accessibilityRole="button"
              accessibilityLabel={item.isPinned ? 'Unpin chat' : 'Pin chat'}
            >
              <Feather
                name="star"
                size={13}
                color={
                  item.isPinned ? theme.colors.primary : theme.colors.textMuted
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickActionBtn,
                item.isMuted && styles.quickActionBtnActive,
              ]}
              onPress={(event) => stopRowPress(event, onToggleMute)}
              accessibilityRole="button"
              accessibilityLabel={item.isMuted ? 'Unmute chat' : 'Mute chat'}
            >
              <Feather
                name={item.isMuted ? 'bell-off' : 'bell'}
                size={13}
                color={
                  item.isMuted ? theme.colors.primary : theme.colors.textMuted
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickActionBtn,
                item.isArchived && styles.quickActionBtnActive,
              ]}
              onPress={(event) => stopRowPress(event, onToggleArchive)}
              accessibilityRole="button"
              accessibilityLabel={
                item.isArchived ? 'Unarchive chat' : 'Archive chat'
              }
            >
              <Feather
                name={item.isArchived ? 'inbox' : 'archive'}
                size={13}
                color={
                  item.isArchived
                    ? theme.colors.primary
                    : theme.colors.textMuted
                }
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
  );
}
