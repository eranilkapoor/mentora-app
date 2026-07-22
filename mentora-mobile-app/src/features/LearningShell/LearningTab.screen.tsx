import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import {
  useGetStudentsQuery,
  useGetSubjectsQuery,
  useGetStudentSchedulesQuery,
  useGetLearningEntitlementsQuery,
  useGetStudentProgressQuery,
} from '@/store/services/learningApi.service';

type LearningTabScreenProps = {
  title: string;
  subtitle: string;
  items: string[];
  mode?: 'learn' | 'schedule' | 'progress';
};

const DEMO_STUDENT_ID = 'student-1';

export default function LearningTabScreen({
  title,
  subtitle,
  items,
  mode = 'learn',
}: LearningTabScreenProps): React.ReactElement {
  const { theme } = useTheme();
  const { data: students, isFetching: studentsLoading } = useGetStudentsQuery();
  const { data: subjects, isFetching: subjectsLoading } = useGetSubjectsQuery();
  const { data: schedules, isFetching: schedulesLoading } =
    useGetStudentSchedulesQuery({ studentProfileId: DEMO_STUDENT_ID });
  const { data: entitlements } = useGetLearningEntitlementsQuery({
    studentProfileId: DEMO_STUDENT_ID,
  });
  const { data: progress } = useGetStudentProgressQuery({
    studentProfileId: DEMO_STUDENT_ID,
  });
  const remainingMinutes =
    entitlements?.data?.reduce(
      (total, entitlement) => total + entitlement.remainingMinutes,
      0
    ) ?? 0;

  const isLoading = studentsLoading || subjectsLoading || schedulesLoading;
  const primaryCards = useMemo(() => {
    if (mode === 'schedule') {
      return [
        {
          icon: 'calendar' as const,
          title: 'Upcoming sessions',
          value: String(schedules?.data?.length ?? 0),
        },
        {
          icon: 'video' as const,
          title: 'Minutes left',
          value: String(remainingMinutes),
        },
      ];
    }

    if (mode === 'progress') {
      return [
        {
          icon: 'clock' as const,
          title: 'Learning minutes',
          value: String(progress?.data?.totalLearningMinutes ?? 0),
        },
        {
          icon: 'bar-chart-2' as const,
          title: 'Completed sessions',
          value: String(progress?.data?.completedSessions ?? 0),
        },
      ];
    }

    return [
      {
        icon: 'users' as const,
        title: 'Students',
        value: String(students?.data?.length ?? 0),
      },
      {
        icon: 'book-open' as const,
        title: 'Subjects',
        value: String(subjects?.data?.length ?? 0),
      },
      {
        icon: 'clock' as const,
        title: 'Tutor minutes',
        value: String(remainingMinutes),
      },
    ];
  }, [
    mode,
    progress?.data,
    remainingMinutes,
    schedules?.data,
    students?.data,
    subjects?.data,
  ]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>

        <View style={styles.cardGrid}>
          {primaryCards.map((card) => (
            <View
              key={card.title}
              style={[
                styles.metricCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.divider,
                },
              ]}
            >
              <Feather
                name={card.icon}
                size={18}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.metricValue,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {card.value}
              </Text>
              <Text
                style={[styles.metricLabel, { color: theme.colors.textMuted }]}
              >
                {card.title}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.guardCard,
            {
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.primaryBorder,
            },
          ]}
        >
          <Feather name="shield" size={18} color={theme.colors.primary} />
          <View style={styles.guardCopy}>
            <Text
              style={[styles.guardTitle, { color: theme.colors.textPrimary }]}
            >
              Enterprise AI guard
            </Text>
            <Text
              style={[styles.guardText, { color: theme.colors.textSecondary }]}
            >
              Join and AI tutor actions must pass schedule, entitlement,
              subject, parental-control, and safety checks on the server.
            </Text>
          </View>
        </View>

        <View style={styles.list}>
          {items.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.row,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.divider,
                },
              ]}
            >
              <Text
                style={[styles.rowText, { color: theme.colors.textPrimary }]}
              >
                {item}
              </Text>
              <Feather
                name="chevron-right"
                size={18}
                color={theme.colors.textMuted}
              />
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text
              style={[styles.loadingText, { color: theme.colors.textMuted }]}
            >
              Syncing learning data
            </Text>
          </View>
        ) : null}

        <Text style={[styles.apiHint, { color: theme.colors.textMuted }]}>
          Data hooks are ready for /students, /subjects, /schedules,
          /learning-entitlements, /progress, and /ai-tutor.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  metricCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  guardCard: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  guardCopy: {
    flex: 1,
    gap: 3,
  },
  guardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  guardText: {
    fontSize: 12,
    lineHeight: 18,
  },
  list: {
    gap: 10,
    marginTop: 18,
  },
  row: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  apiHint: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
  },
});
