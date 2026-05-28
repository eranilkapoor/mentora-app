import { Image, Text, View } from 'react-native';

import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { chatStyles } from '../Chat.styles';
import { formatTime, Message } from '../Chat.types';

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
          {isMe && (
            <Text style={styles.readTick}>{item.read ? 'Read' : 'Sent'}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
