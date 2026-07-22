import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { skipToken } from '@reduxjs/toolkit/query';
import { useTheme } from '@/core/theme/ThemeProvider';
import {
  LearningEntitlement,
  useGetLearningEntitlementsQuery,
  useGetStudentsQuery,
  useGetStudentProgressQuery,
  useGetStudentSchedulesQuery,
  useGetSubjectsQuery,
} from '@/store/services/learningApi.service';

type LearningTabScreenProps = {
  title: string;
  subtitle: string;
  items: string[];
  mode?: 'learn' | 'schedule' | 'progress';
};

type EntityWithMongoId = {
  id?: string;
  _id?: string;
};

const getEntityId = (entity?: EntityWithMongoId): string | undefined =>
  entity?.id ?? entity?._id;

const getRemainingMinutes = (entitlement: LearningEntitlement): number => {
  if (typeof entitlement.remainingMinutes === 'number') {
    return entitlement.remainingMinutes;
  }

  const allocated = entitlement.allocatedQuantity ?? 0;
  const used = entitlement.usedQuantity ?? 0;
  return Math.max(allocated - used, 0);
};

export default function LearningTabScreen({
  title,
  subtitle,
  items,
  mode = 'learn',
}: LearningTabScreenProps): React.ReactElement {
  const { theme } = useTheme();
  const {
    data: students,
    isFetching: studentsLoading,
    isError: studentsError,
    refetch: refetchStudents,
  } = useGetStudentsQuery();
  const {
    data: subjects,
    isFetching: subjectsLoading,
    isError: subjectsError,
    refetch: refetchSubjects,
  } = useGetSubjectsQuery();

  const selectedStudent = students?.data?.[0];
  const selectedStudentId = getEntityId(selectedStudent);
  const childQueryArg = selectedStudentId
    ? { studentProfileId: selectedStudentId }
    : skipToken;

  const {
    data: schedules,
    isFetching: schedulesLoading,
    isError: schedulesError,
    refetch: refetchSchedules,
  } = useGetStudentSchedulesQuery(childQueryArg);
  const {
    data: entitlements,
    isFetching: entitlementsLoading,
    isError: entitlementsError,
    refetch: refetchEntitlements,
  } = useGetLearningEntitlementsQuery(childQueryArg);
  const {
    data: progress,
    isFetching: progressLoading,
    isError: progressError,
    refetch: refetchProgress,
  } = useGetStudentProgressQuery(childQueryArg);

  const remainingMinutes =
    entitlements?.data?.reduce(
      (total, entitlement) => total + getRemainingMinutes(entitlement),
      0
    ) ?? 0;

  const upcomingSchedules = useMemo(
    () =>
      schedules?.data?.filter((schedule) =>
        ['scheduled', 'started', 'active'].includes(schedule.status)
      ) ?? [],
    [schedules?.data]
  );
  const activeEntitlements =
    entitlements?.data?.filter((entitlement) => entitlement.status === 'active')
      .length ?? 0;
  const isLoading =
    studentsLoading ||
    subjectsLoading ||
    schedulesLoading ||
    entitlementsLoading ||
    progressLoading;
  const hasError =
    studentsError ||
    subjectsError ||
    schedulesError ||
    entitlementsError ||
    progressError;

  const primaryCards = useMemo(() => {
    if (mode === 'schedule') {
      return [
        {
          icon: 'calendar' as const,
          title: 'Upcoming',
          value: String(upcomingSchedules.length),
        },
        {
          icon: 'video' as const,
          title: 'Tutor minutes',
          value: String(remainingMinutes),
        },
        {
          icon: 'check-circle' as const,
          title: 'Active access',
          value: String(activeEntitlements),
        },
      ];
    }

    if (mode === 'progress') {
      return [
        {
          icon: 'clock' as const,
          title: 'Minutes',
          value: String(progress?.data?.totalLearningMinutes ?? 0),
        },
        {
          icon: 'bar-chart-2' as const,
          title: 'Completed',
          value: String(progress?.data?.completedSessions ?? 0),
        },
        {
          icon: 'target' as const,
          title: 'Subjects',
          value: String(progress?.data?.subjectProgress?.length ?? 0),
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
        icon: 'zap' as const,
        title: 'AI minutes',
        value: String(remainingMinutes),
      },
    ];
  }, [
    activeEntitlements,
    mode,
    progress?.data,
    remainingMinutes,
    students?.data,
    subjects?.data,
    upcomingSchedules.length,
  ]);

  const detailRows = useMemo(() => {
    if (mode === 'schedule') {
      return upcomingSchedules.slice(0, 4).map((schedule) => ({
        icon: schedule.deliveryMode === 'video' ? 'video' : 'message-circle',
        title: schedule.title ?? schedule.subjectName ?? 'Learning session',
        meta: new Date(schedule.startAt).toLocaleString(),
      }));
    }

    if (mode === 'progress') {
      return (
        progress?.data?.subjectProgress?.slice(0, 4).map((subject) => ({
          icon: 'trending-up',
          title: subject.subjectName,
          meta: `${subject.masteryPercentage}% mastery`,
        })) ?? []
      );
    }

    return (
      subjects?.data?.slice(0, 4).map((subject) => ({
        icon: 'book',
        title: subject.name,
        meta: subject.code ?? subject.category ?? 'Available subject',
      })) ?? []
    );
  }, [
    mode,
    progress?.data?.subjectProgress,
    subjects?.data,
    upcomingSchedules,
  ]);

  const handleRetry = (): void => {
    void refetchStudents();
    void refetchSubjects();
    if (selectedStudentId) {
      void refetchSchedules();
      void refetchEntitlements();
      void refetchProgress();
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.backgroundPage }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>

        {!selectedStudentId && !studentsLoading ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Feather name="user-plus" size={22} color={theme.colors.primary} />
            <View style={styles.emptyCopy}>
              <Text
                style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}
              >
                Add a student profile
              </Text>
              <Text
                style={[styles.emptyText, { color: theme.colors.textMuted }]}
              >
                Learning, schedule, and progress data will appear after a
                student profile is created or linked to this account.
              </Text>
            </View>
          </View>
        ) : null}

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
                numberOfLines={1}
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
              Schedule-aware AI access
            </Text>
            <Text
              style={[styles.guardText, { color: theme.colors.textSecondary }]}
            >
              Tutor entry is validated against schedule windows, subscription
              minutes, subject access, parental controls, and safety rules.
            </Text>
          </View>
        </View>

        <View style={styles.list}>
          {detailRows.length > 0
            ? detailRows.map((item) => (
                <Pressable
                  key={`${item.title}-${item.meta}`}
                  style={[
                    styles.row,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.divider,
                    },
                  ]}
                >
                  <Feather
                    name={
                      item.icon as React.ComponentProps<typeof Feather>['name']
                    }
                    size={17}
                    color={theme.colors.secondary}
                  />
                  <View style={styles.rowCopy}>
                    <Text
                      style={[
                        styles.rowText,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.rowMeta,
                        { color: theme.colors.textMuted },
                      ]}
                    >
                      {item.meta}
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              ))
            : items.map((item) => (
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
                    style={[
                      styles.rowText,
                      { color: theme.colors.textPrimary },
                    ]}
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

        {hasError ? (
          <Pressable
            style={[
              styles.retryCard,
              {
                backgroundColor: theme.colors.errorLight,
                borderColor: theme.colors.error,
              },
            ]}
            onPress={handleRetry}
          >
            <Feather name="refresh-cw" size={17} color={theme.colors.error} />
            <Text style={[styles.retryText, { color: theme.colors.error }]}>
              Learning data could not sync. Tap to retry.
            </Text>
          </Pressable>
        ) : null}

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
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
  emptyCard: {
    alignItems: 'flex-start',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    padding: 14,
  },
  emptyCopy: {
    flex: 1,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
  },
  cardGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  metricCard: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 96,
    padding: 12,
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
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
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
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  rowMeta: {
    fontSize: 12,
    lineHeight: 17,
  },
  retryCard: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    padding: 12,
  },
  retryText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
