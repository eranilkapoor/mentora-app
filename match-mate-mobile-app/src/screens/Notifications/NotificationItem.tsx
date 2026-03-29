import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../core/constants/colors';

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
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundPage,
  },
  unread: {
    backgroundColor: Colors.backgroundPage,
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
    color: Colors.textPrimary,
  },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
