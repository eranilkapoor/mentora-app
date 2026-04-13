import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationStyles } from './NotificationsScreen.styles';
import { Colors } from '../../core/constants/colors';
import { NotifSection } from './Notifications.types';
import { INITIAL_NOTIFICATIONS } from './Notifications.constants';
import { EmptyState } from './components/EmptyState';
import { NotifItem } from './components/NotifItem';

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function NotificationsScreen(): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  const [sections, setSections] = useState<NotifSection[]>(
    INITIAL_NOTIFICATIONS
  );

  const unreadCount = sections
    .flatMap((s) => s.data)
    .filter((n) => n.unread).length;

  const markAllRead = useCallback((): void => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        data: section.data.map((n) => ({ ...n, unread: false })),
      }))
    );
  }, []);

  const markRead = useCallback((id: string): void => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        data: section.data.map((n) =>
          n.id === id ? { ...n, unread: false } : n
        ),
      }))
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
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
