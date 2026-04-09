import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SectionList,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationStyles } from './NotificationsScreen.styles';
import { Colors } from '../../core/constants/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  icon: string;
  iconColor?: string;
}

interface NotifSection {
  title: string;
  icon: string;
  data: Notification[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: NotifSection[] = [
  {
    title: 'New',
    icon: 'star',
    data: [
      {
        id: '1',
        title: 'New Match Found! 🎉',
        message: 'Priya from Delhi matches 92% of your preferences.',
        time: '2 min ago',
        unread: true,
        icon: 'heart',
        iconColor: Colors.danger,
      },
      {
        id: '2',
        title: 'Profile Viewed',
        message: 'Someone from Mumbai viewed your profile.',
        time: '15 min ago',
        unread: true,
        icon: 'eye',
      },
      {
        id: '3',
        title: 'Interest Accepted 🎊',
        message: 'Anjali accepted your interest request.',
        time: '1 hour ago',
        unread: true,
        icon: 'check-circle',
        iconColor: Colors.success,
      },
    ],
  },
  {
    title: 'Earlier',
    icon: 'clock',
    data: [
      {
        id: '4',
        title: 'Profile Shortlisted',
        message: 'Your profile has been shortlisted by 3 new members.',
        time: 'Yesterday',
        unread: false,
        icon: 'bookmark',
      },
      {
        id: '5',
        title: 'Complete Your Profile',
        message: 'Add more details to get 3× more matches.',
        time: '2 days ago',
        unread: false,
        icon: 'user',
      },
      {
        id: '6',
        title: 'New Message',
        message: 'You have a new message from Rahul.',
        time: '3 days ago',
        unread: false,
        icon: 'message-circle',
      },
    ],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function NotifItem({
  item,
  isLast,
  onPress,
}: {
  item: Notification;
  isLast: boolean;
  onPress: (id: string) => void;
}): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);

  return (
    <TouchableOpacity
      style={[
        styles.notifItem,
        isLast && styles.notifItemLast,
        item.unread && styles.notifItemUnread,
      ]}
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View
        style={[
          styles.notifIconWrapper,
          item.unread && styles.notifIconWrapperUnread,
        ]}
      >
        <Feather
          name={item.icon}
          size={18}
          color={item.iconColor ?? (item.unread ? Colors.primary : Colors.textMuted)}
        />
      </View>

      <View style={styles.notifContent}>
        <View style={styles.notifTitleRow}>
          <Text
            style={[
              styles.notifTitle,
              item.unread && styles.notifTitleUnread,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>

      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

function EmptyState(): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrapper}>
        <Feather name="bell-off" size={32} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        When you get matches, messages or activity{'\n'}they'll show up here.
      </Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function NotificationsScreen(): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  const [sections, setSections] = useState<NotifSection[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = sections
    .flatMap((s) => s.data)
    .filter((n) => n.unread).length;

  const markAllRead = useCallback((): void => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        data: section.data.map((n) => ({ ...n, unread: false })),
      })),
    );
  }, []);

  const markRead = useCallback((id: string): void => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        data: section.data.map((n) =>
          n.id === id ? { ...n, unread: false } : n,
        ),
      })),
    );
  }, []);

  const allNotifs = sections.flatMap((s) => s.data);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header Card ──────────────────────────────────────────── */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrapper}>
              <Feather name="bell" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'}
              </Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={markAllRead}
              accessibilityRole="button"
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {allNotifs.length === 0 ? (
          <EmptyState />
        ) : (
          sections.map((section) =>
            section.data.length === 0 ? null : (
              <View key={section.title} style={styles.sectionCard}>
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrapper}>
                    <Feather
                      name={section.icon}
                      size={13}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.data.some((n) => n.unread) && (
                    <Text style={styles.sectionCount}>
                      {section.data.filter((n) => n.unread).length}
                    </Text>
                  )}
                </View>

                {/* Items */}
                {section.data.map((item, index) => (
                  <NotifItem
                    key={item.id}
                    item={item}
                    isLast={index === section.data.length - 1}
                    onPress={markRead}
                  />
                ))}
              </View>
            ),
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}