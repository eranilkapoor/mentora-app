import { Image, Text, View } from 'react-native';
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

export function MessageBubble({ item }: { item: Message }): React.ReactElement {
  const isMe = item.senderId === 'me';
  const styles = useThemedStyles(chatStyles);

  return (
    <View
      style={[styles.messageRow, isMe ? styles.rightAlign : styles.leftAlign]}
    >
      <View
        style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
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
      </View>
    </View>
  );
}
