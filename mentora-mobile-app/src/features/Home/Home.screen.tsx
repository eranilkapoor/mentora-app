import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { homeStyles } from './Home.styles';
import { HomeScreenProps } from './Home.types';
import { useGetUnreadNotificationCountQuery } from '@/store/services/notificationApi.service';
import { useAppSelector } from '@/store/hooks';
import { useGetMyProfileQuery } from '@/store/services/profileApi.service';

type DashboardStudent = {
  id: string;
  name: string;
  grade: string;
  focus: string;
  progress: number;
  nextSession: string;
};

const DASHBOARD_STUDENTS: DashboardStudent[] = [
  {
    id: 'student-1',
    name: 'Primary student',
    grade: 'Grade 10',
    focus: 'Mathematics',
    progress: 68,
    nextSession: 'Today, 6:00 PM',
  },
  {
    id: 'student-2',
    name: 'Second child',
    grade: 'Grade 7',
    focus: 'Science',
    progress: 54,
    nextSession: 'Tomorrow, 5:30 PM',
  },
];

export default function HomeScreen({
  navigation,
}: HomeScreenProps): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const { data: profileResponse } = useGetMyProfileQuery();
  const { data: unreadNotificationData } = useGetUnreadNotificationCountQuery();

  const unreadNotificationCount =
    unreadNotificationData?.success && unreadNotificationData.data
      ? unreadNotificationData.data.unreadCount
      : 0;

  const firstName =
    user?.firstName ??
    profileResponse?.data?.personal?.firstName ??
    t('home.learner_fallback');
  const completion = Math.min(
    100,
    Math.max(
      0,
      Math.round(profileResponse?.data?.profileCompletionPercentage ?? 42)
    )
  );

  const stats = useMemo(
    () => [
      { label: t('home.stat_children'), value: '2', icon: 'users' },
      { label: t('home.stat_sessions'), value: '4', icon: 'calendar' },
      { label: t('home.stat_minutes'), value: '180', icon: 'clock' },
      {
        label: t('home.stat_progress'),
        value: `${completion}%`,
        icon: 'bar-chart-2',
      },
    ],
    [completion, t]
  );

  const navigateToTab = (
    screen: 'Learn' | 'Schedule' | 'Progress' | 'Profile'
  ) => {
    navigation.getParent()?.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header
        title={t('home.title')}
        subtitle={t('home.subtitle', { name: firstName })}
        actions={[
          {
            icon: 'bell',
            badge: unreadNotificationCount > 0,
            onPress: () => navigation.navigate('Notifications'),
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroPanel}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>{t('home.hero_eyebrow')}</Text>
            <Text style={styles.heroTitle}>{t('home.hero_title')}</Text>
            <Text style={styles.heroSubtitle}>{t('home.hero_subtitle')}</Text>
          </View>
          <Pressable
            style={styles.heroButton}
            onPress={() => navigateToTab('Schedule')}
          >
            <Feather name="calendar" size={18} color={theme.colors.white} />
            <Text style={styles.heroButtonText}>
              {t('home.schedule_class')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.dashboardStatsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.dashboardStatCard}>
              <Feather
                name={stat.icon as React.ComponentProps<typeof Feather>['name']}
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.dashboardStatValue}>{stat.value}</Text>
              <Text style={styles.dashboardStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionGrid}>
          <QuickAction
            icon="book-open"
            label={t('home.action_learn')}
            onPress={() => navigateToTab('Learn')}
          />
          <QuickAction
            icon="cpu"
            label={t('home.action_ai_tutor')}
            onPress={() => navigateToTab('Learn')}
          />
          <QuickAction
            icon="trending-up"
            label={t('home.action_progress')}
            onPress={() => navigateToTab('Progress')}
          />
          <QuickAction
            icon="user"
            label={t('home.action_profile')}
            onPress={() => navigateToTab('Profile')}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.next_sessions')}</Text>
        </View>

        {DASHBOARD_STUDENTS.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <View style={styles.studentAvatar}>
              <Feather name="user" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.studentBody}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentMeta}>
                {student.grade} · {student.focus}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${student.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.studentSession}>{student.nextSession}</Text>
            </View>
            <Pressable
              style={styles.iconButton}
              onPress={() => navigateToTab('Schedule')}
            >
              <Feather
                name="chevron-right"
                size={20}
                color={theme.colors.textMuted}
              />
            </Pressable>
          </View>
        ))}

        <View style={styles.guardCard}>
          <Feather name="shield" size={20} color={theme.colors.primary} />
          <View style={styles.guardCopy}>
            <Text style={styles.guardTitle}>{t('home.guard_title')}</Text>
            <Text style={styles.guardText}>{t('home.guard_text')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();

  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Feather name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}
