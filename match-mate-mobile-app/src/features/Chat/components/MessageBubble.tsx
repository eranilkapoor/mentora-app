import { Image, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { chatStyles } from '../Chat.styles';
import { formatTime, Message } from '../Chat.types';

function MessageStatusTicks({
  status,
}: {
  status: Message['status'];
}): React.ReactElement {
  const styles = useThemedStyles(chatStyles);
  const { theme } = useTheme();
  const isRead = status === 'read';
  const isDelivered = status === 'delivered' || isRead;
  const tickColor = isRead ? theme.colors.success : theme.colors.accentLight;

  return (
    <View
      style={styles.tickWrap}
      accessibilityLabel={isRead ? 'Read' : isDelivered ? 'Delivered' : 'Sent'}
    >
      <Feather name="check" size={13} color={tickColor} />
      {isDelivered ? (
        <Feather
          name="check"
          size={13}
          color={tickColor}
          style={styles.secondTick}
        />
      ) : null}
    </View>
  );
}

export function MessageBubble({
  item,
  onLongPress,
  onReact,
}: {
  item: Message;
  onLongPress?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
}): React.ReactElement {
  const isMe = item.senderId === 'me';
  const styles = useThemedStyles(chatStyles);
  const quickReactions = ['👍', '❤️', '😂'];

  return (
    <View
      style={[styles.messageRow, isMe ? styles.rightAlign : styles.leftAlign]}
    >
      <TouchableOpacity
        style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
        activeOpacity={0.9}
        onLongPress={() => onLongPress?.(item)}
        accessibilityRole="text"
      >
        {item.type === 'image' && item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <Text style={[styles.messageText, isMe && styles.myText]}>
            {item.text}
          </Text>
        )}

        <View style={styles.timeRow}>
          <Text style={[styles.time, isMe && styles.timeMe]}>
            {formatTime(item.timestamp)}
          </Text>
          {isMe ? <MessageStatusTicks status={item.status} /> : null}
        </View>
        {item.reactions?.length ? (
          <View style={styles.reactionSummary}>
            {item.reactions.map((reaction) => (
              <Text
                key={`${reaction.userId}-${reaction.emoji}`}
                style={styles.reactionSummaryText}
              >
                {reaction.emoji}
              </Text>
            ))}
          </View>
        ) : null}
      </TouchableOpacity>
      <View style={[styles.reactionBar, isMe && styles.reactionBarMe]}>
        {quickReactions.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reactionButton}
            onPress={() => onReact?.(item, emoji)}
            accessibilityRole="button"
            accessibilityLabel={`React with ${emoji}`}
          >
            <Text style={styles.reactionButtonText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
