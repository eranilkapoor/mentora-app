import { useEffect, useState } from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Audio } from 'expo-av';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const isRead = status === 'read';
  const isDelivered = status === 'delivered' || isRead;
  const tickColor = isRead ? theme.colors.success : theme.colors.accentLight;

  return (
    <View
      style={styles.tickWrap}
      accessibilityLabel={
        isRead
          ? t('chat.status_read')
          : isDelivered
            ? t('chat.status_delivered')
            : t('chat.status_sent')
      }
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
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const quickReactions = ['\u{1F44D}', '\u2764\uFE0F', '\u{1F602}'];

  useEffect(
    () => () => {
      if (sound) {
        void sound.unloadAsync();
      }
    },
    [sound]
  );

  const toggleAudioPlayback = async (): Promise<void> => {
    if (!item.audioUrl) return;

    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
        setIsPlayingAudio(false);
        return;
      }
      await sound.replayAsync();
      setIsPlayingAudio(true);
      return;
    }

    const created = await Audio.Sound.createAsync(
      { uri: item.audioUrl },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      }
    );
    setSound(created.sound);
    setIsPlayingAudio(true);
  };

  return (
    <Pressable
      style={[styles.messageRow, isMe ? styles.rightAlign : styles.leftAlign]}
      onHoverIn={() => setShowQuickReactions(true)}
      onHoverOut={() => setShowQuickReactions(false)}
      onFocus={() => setShowQuickReactions(true)}
      onBlur={() => setShowQuickReactions(false)}
    >
      <TouchableOpacity
        style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
        activeOpacity={0.9}
        onPressIn={() => setShowQuickReactions(true)}
        onLongPress={() => onLongPress?.(item)}
        accessibilityRole="text"
      >
        {item.type === 'image' && item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : item.type === 'audio' && item.audioUrl ? (
          <TouchableOpacity
            style={styles.audioBubble}
            onPress={() => {
              void toggleAudioPlayback();
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('chat.play_voice_message')}
          >
            <View style={[styles.audioPlayBtn, isMe && styles.audioPlayBtnMe]}>
              <Feather
                name={isPlayingAudio ? 'pause' : 'play'}
                size={15}
                color={isMe ? theme.colors.primary : theme.colors.white}
              />
            </View>
            <View style={styles.audioWave}>
              {[0, 1, 2, 3, 4].map((bar) => (
                <View
                  key={bar}
                  style={[
                    styles.audioWaveBar,
                    isMe && styles.audioWaveBarMe,
                    { height: 10 + ((bar % 3) + 1) * 5 },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.audioLabel, isMe && styles.audioLabelMe]}>
              {t('chat.voice_message')}
            </Text>
          </TouchableOpacity>
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
      {showQuickReactions ? (
        <View style={[styles.reactionBar, isMe && styles.reactionBarMe]}>
          {quickReactions.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionButton}
              onPress={() => {
                onReact?.(item, emoji);
                setShowQuickReactions(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('chat.react_with_emoji', { emoji })}
            >
              <Text style={styles.reactionButtonText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}
