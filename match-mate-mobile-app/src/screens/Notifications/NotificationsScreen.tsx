import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationStyles } from './NotificationsScreen.styles';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  title: string;
  message: string;
  time: string;
  unread?: boolean;
  styles: ReturnType<typeof notificationStyles>;
}

const mockNotifications = [
  {
    id: '1',
    title: 'New Match Found',
    message: 'You have a new match suggestion today.',
    time: '2 min ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Profile Viewed',
    message: 'Someone viewed your profile.',
    time: '1 hour ago',
  },
  {
    id: '3',
    title: 'Interest Accepted',
    message: 'Your interest has been accepted 🎉',
    time: 'Yesterday',
  },
];

export function NotificationItem({
  title,
  message,
  time,
  unread = false,
  styles,
}: Props) {
  return (
    <View style={[styles.innerContainer, unread && styles.unread]}>
      <Ionicons
        name="notifications-outline"
        size={22}
        color={unread ? '#E91E63' : '#999'}
        style={styles.icon}
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const styles = useThemedStyles(notificationStyles);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <FlatList
          data={mockNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem {...item} styles={styles} />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}
