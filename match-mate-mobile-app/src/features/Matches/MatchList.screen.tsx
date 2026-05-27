import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Platform,
  RefreshControl,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from './MatchList.styles';
import {
  FilterState,
  MatchItem,
  MatchListScreenProps,
  TabKey,
} from './MatchList.types';
import { TAB_CONFIG } from './MatchList.constants';
import { useMatchListData } from './hooks/useMatchListData';
import { useMatchListActions } from './hooks/useMatchListActions';
import { MatchCard } from './components/MatchCard';
import { MatchTabs } from './components/MatchTabs';
import { MatchListHeader } from './components/MatchListHeader';
import { MatchEmpty } from './components/MatchEmpty';

function SkeletonCard(): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonPhoto} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        <View style={[styles.skeletonLine, styles.skeletonLineXShort]} />
      </View>
    </View>
  );
}

export default function MatchListScreen({
  navigation,
}: MatchListScreenProps): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabKey>('recommended');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    cityFilter: '',
    ageFilter: 'any',
    casteFilter: 'any',
    verifiedOnly: false,
  });
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const {
    visibleMatches,
    matches,
    acceptedMatches,
    shortlistedMatches,
    requestMatches,
    activeMeta,
    activeLoading,
    activeFetching,
    refetch,
    refetchMyMatches,
    refetchShortlisted,
    refetchShortlistedStatus,
    refetchSentInterests,
    refetchReceivedInterests,
  } = useMatchListData(activeTab, query, filters, page, setPage);

  const { handlePrimaryAction, handleShortlist } =
    useMatchListActions(navigation);

  // ─── Derived ──────────────────────────────────────────────────────────

  const activeFilterCount = useMemo(
    () =>
      [
        filters.cityFilter.trim(),
        filters.ageFilter !== 'any',
        filters.casteFilter !== 'any',
        filters.verifiedOnly,
      ].filter(Boolean).length,
    [filters]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return visibleMatches;
    const q = query.toLowerCase().trim();
    return visibleMatches.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.profession.toLowerCase().includes(q)
    );
  }, [query, visibleMatches]);

  const tabs = useMemo(
    () =>
      TAB_CONFIG.map((tab) => ({
        ...tab,
        count:
          tab.key === 'matched'
            ? acceptedMatches.length
            : tab.key === 'shortlisted'
              ? shortlistedMatches.length
              : tab.key === 'requests'
                ? requestMatches.length
                : activeTab === tab.key
                  ? matches.length
                  : 0,
      })),
    [
      acceptedMatches.length,
      activeTab,
      matches.length,
      requestMatches.length,
      shortlistedMatches.length,
    ]
  );

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key);
    setPage(1);
  }, []);

  const handleFiltersChange = useCallback((patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      cityFilter: '',
      ageFilter: 'any',
      casteFilter: 'any',
      verifiedOnly: false,
    });
  }, []);

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    setPage(1);
    const activeRefetch =
      activeTab === 'requests'
        ? refetchReceivedInterests
        : activeTab === 'shortlisted'
          ? refetchShortlisted
          : activeTab === 'matched'
            ? refetchMyMatches
            : refetch;

    await Promise.all([
      activeRefetch(),
      activeTab !== 'shortlisted'
        ? refetchShortlistedStatus()
        : Promise.resolve(),
      refetchSentInterests(),
    ]);
    setRefreshing(false);
  }, [
    activeTab,
    refetch,
    refetchMyMatches,
    refetchReceivedInterests,
    refetchSentInterests,
    refetchShortlisted,
    refetchShortlistedStatus,
  ]);

  const loadMore = useCallback(() => {
    if (activeFetching || !activeMeta?.hasNextPage) return;
    setPage((p) => p + 1);
  }, [activeFetching, activeMeta?.hasNextPage]);

  // ─── Render ───────────────────────────────────────────────────────────

  const renderItem: ListRenderItem<MatchItem> = useCallback(
    ({ item }) => (
      <MatchCard
        item={item}
        onViewProfile={() =>
          navigation.navigate('MatchDetails', { userId: item.id })
        }
        onPrimaryAction={() => {
          void handlePrimaryAction(item);
        }}
        onShortlist={() => {
          void handleShortlist(item);
        }}
      />
    ),
    [handlePrimaryAction, handleShortlist, navigation]
  );

  const ListHeader = useCallback(
    () => (
      <MatchListHeader
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
        resultCount={filtered.length}
      />
    ),
    [
      activeFilterCount,
      filtered.length,
      filters,
      handleClearFilters,
      handleFiltersChange,
      query,
      showFilters,
    ]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={t('matches.title')}
        subtitle={t('matches.subtitle')}
        actions={[
          {
            icon: 'filter',
            badge: activeFilterCount > 0,
            onPress: () => setShowFilters((v) => !v),
          },
        ]}
      />

      <MatchTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {activeLoading ? (
        <>
          <ListHeader />
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={<MatchEmpty hasQuery={Boolean(query.trim())} />}
          ListFooterComponent={
            activeFetching && page > 1 ? (
              <View style={styles.listFooter}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                void onRefresh();
              }}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
    </SafeAreaView>
  );
}
