import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { ChatMatch, formatTime } from '../ChatList.types';
import { chatListStyles } from '../ChatList.styles';
import { Image, TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export function ChatRow({
  item,
  onPress,
}: {
  item: ChatMatch;
  onPress: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(chatListStyles);

  return (
    <TouchableOpacity
      style={[styles.card, item.unreadCount > 0 && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
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
            {item.name}, {item.age}
          </Text>
          <Text
            style={[styles.time, item.unreadCount > 0 && styles.timeUnread]}
          >
            {formatTime(item.matchedAt)}
          </Text>
        </View>

        <View style={styles.cityRow}>
          <Feather name="map-pin" size={11} color={Colors.textMuted} />
          <Text style={styles.city}>{item.city}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage || 'Start a conversation…'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
