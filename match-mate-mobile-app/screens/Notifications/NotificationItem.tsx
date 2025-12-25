import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  message: string;
  time: string;
  unread?: boolean;
}

export default function NotificationItem({
  title,
  message,
  time,
  unread = false,
}: Props) {
  return (
    <View style={[styles.container, unread && styles.unread]}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  unread: {
    backgroundColor: '#FFF5F8',
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
    color: '#111',
  },
  message: {
    fontSize: 13,
    color: '#555',
  },
  time: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});
