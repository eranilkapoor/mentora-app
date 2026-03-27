import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import NotificationItem from './NotificationItem';
import { Colors } from '../../constants/colors';

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

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem {...item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPage,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textMuted,
  },
});
