import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  useGetMatchStatsQuery,
  useGetWhoViewedMeQuery,
} from '@/store/services/matchApi.service';
import { SettingsScreenProps } from '@/features/Settings/Settings.types';

type InsightCard = {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Feather>['name'];
};

const safeRate = (value: number, total: number): number =>
  total > 0 ? Math.round((value / total) * 100) : 0;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      padding: 16,
      gap: 14,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    card: {
      width: '47%',
      minHeight: 104,
      padding: 14,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      gap: 8,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
    },
    value: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    label: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    section: {
      padding: 14,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      gap: 10,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    rowLabel: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    rowValue: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    progressTrack: {
      height: 7,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: theme.colors.border,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    loading: {
      padding: 32,
    },
    emptyText: {
      fontSize: 13,
      color: theme.colors.textMuted,
      lineHeight: 19,
    },
  });

export default function UserInsightsScreen({
  navigation,
}: SettingsScreenProps): React.ReactElement {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { data: statsData, isLoading: statsLoading } = useGetMatchStatsQuery();
  const { data: viewersData, isLoading: viewersLoading } =
    useGetWhoViewedMeQuery({ page: 1, limit: 5 });

  const stats = statsData?.success ? statsData.data : undefined;
  const viewerCount = viewersData?.success ? viewersData.data.length : 0;

  const cards = useMemo<InsightCard[]>(
    () => [
      {
        label: 'Active matches',
        value: stats?.activeMatches ?? 0,
        icon: 'heart',
      },
      {
        label: 'Profile views',
        value: stats?.profileViews ?? viewerCount,
        icon: 'eye',
      },
      {
        label: 'Received interests',
        value: stats?.receivedInterests ?? 0,
        icon: 'inbox',
      },
      {
        label: 'Shortlisted',
        value: stats?.shortlisted ?? 0,
        icon: 'bookmark',
      },
    ],
    [stats, viewerCount]
  );

  const acceptedRate = safeRate(
    stats?.acceptedInterests ?? 0,
    (stats?.sentInterests ?? 0) + (stats?.receivedInterests ?? 0)
  );
  const chatReadiness = safeRate(
    stats?.activeMatches ?? 0,
    stats?.acceptedInterests ?? 0
  );
  const loading = statsLoading || viewersLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Insights"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator
            style={styles.loading}
            color={theme.colors.primary}
            size="large"
          />
        ) : null}

        <View style={styles.grid}>
          {cards.map((card) => (
            <View key={card.label} style={styles.card}>
              <View style={styles.iconWrap}>
                <Feather
                  name={card.icon}
                  size={17}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.value}>{card.value}</Text>
              <Text style={styles.label}>{card.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversion</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Interest acceptance</Text>
            <Text style={styles.rowValue}>{acceptedRate}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${acceptedRate}%` }]}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              Accepted matches with active match
            </Text>
            <Text style={styles.rowValue}>{chatReadiness}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${chatReadiness}%` }]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent profile viewers</Text>
          {viewersData?.success && viewersData.data.length > 0 ? (
            viewersData.data.map((viewer) => (
              <View
                key={`${viewer.viewerId}-${viewer.viewedAt ?? ''}`}
                style={styles.row}
              >
                <Text style={styles.rowLabel}>
                  {viewer.profile?.personal?.firstName ?? 'Match Mate member'}
                </Text>
                <Text style={styles.rowValue}>
                  {viewer.viewedAt
                    ? new Date(viewer.viewedAt).toLocaleDateString()
                    : 'Recent'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Profile view trends will appear after members start visiting your
              profile.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
