import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as Location from 'expo-location';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
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
import { DEFAULT_FILTERS, TAB_CONFIG } from './MatchList.constants';
import { useMatchListData } from './hooks/useMatchListData';
import { useMatchListActions } from './hooks/useMatchListActions';
import { MatchCard } from './components/MatchCard';
import { MatchTabs } from './components/MatchTabs';
import { MatchEmpty } from './components/MatchEmpty';
import { MatchFilterModal } from './components/MatchFilterModal';
import { MatchSuccessModal } from './components/MatchSuccessModal';
import { MatchListToolbar } from './components/MatchListToolbar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  useGetMyProfileMediaImagesQuery,
  useUpdateProfileLocationMutation,
} from '@/store/services/profileApi.service';
import { useUpdateLocalizationSettingsMutation } from '@/store/services/localizationSettingsApi.service';
import { useGetDiscoveryProfilesQuery } from '@/store/services/matchApi.service';
import { Religions } from '@/core/types';
import { setLocationSharing } from '@/store/slices/settings.slice';
import { getDeviceId } from '@/core/utils/device';
import { Storage } from '@/core/utils/storage';
import { showError } from '@/core/utils/toast';
import { showConfirm } from '@/core/utils/confirm';
import { deriveMatchListViewState } from './hooks/matchListViewState.utils';

interface LocationSyncSnapshot {
  latitude: number;
  longitude: number;
  deviceId: string;
  syncedAt: number;
}

const LOCATION_SYNC_TTL_MS = 24 * 60 * 60 * 1000;
const LOCATION_SYNC_DISTANCE_METERS = 2000;

const getLocationSyncKey = (userId: string): string =>
  `profile-location-sync:${userId}`;

const toRadians = (value: number): number => (value * Math.PI) / 180;

const distanceInMeters = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number => {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

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
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.userId);
  const locationSharing = useAppSelector(
    (state) => state.settings.locationSharing
  );

  const [activeTab, setActiveTab] = useState<TabKey>('recommended');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [matchedSuccessItem, setMatchedSuccessItem] =
    useState<MatchItem | null>(null);
  const [nearbyLocationReady, setNearbyLocationReady] = useState(true);
  const nearbyLocationInFlight = useRef(false);
  const nearbyPermissionPromptInFlight = useRef(false);
  const userSelectedTab = useRef(false);
  const [updateProfileLocation] = useUpdateProfileLocationMutation();
  const [updateLocalizationSettings] = useUpdateLocalizationSettingsMutation();
  const { data: profileMediaImagesResponse } =
    useGetMyProfileMediaImagesQuery();
  const { data: curatedPreview } = useGetDiscoveryProfilesQuery({
    type: 'curated',
    page: 1,
    limit: 1,
  });
  const hasCuratedMatches = Boolean(
    (curatedPreview?.meta?.total ?? curatedPreview?.data?.length ?? 0) > 0
  );

  const {
    visibleMatches,
    matches,
    acceptedMatches,
    shortlistedMatches,
    requestMatches,
    activeMeta,
    activeLoading,
    activeFetching,
    activeError,
    refetch,
    refetchMyMatches,
    refetchShortlisted,
    refetchShortlistedStatus,
    refetchSentInterests,
    refetchReceivedInterests,
  } = useMatchListData(
    activeTab,
    query,
    filters,
    page,
    setPage,
    nearbyLocationReady
  );

  const currentUserPhotoUrl = useMemo(() => {
    const images = profileMediaImagesResponse?.data ?? [];
    const primaryPhoto = images.find((image) => image.isPrimary && image.url);
    if (primaryPhoto?.url) {
      return primaryPhoto.url;
    }

    return images.find((image) => Boolean(image.url))?.url ?? '';
  }, [profileMediaImagesResponse?.data]);

  const {
    handlePrimaryAction,
    handleOpenChat,
    handleRejectRequest,
    handleDismissCurated,
    handleShortlist,
  } = useMatchListActions(navigation, {
    onInterestAccepted: setMatchedSuccessItem,
  });

  // ─── Derived ──────────────────────────────────────────────────────────

  const activeFilterCount = useMemo(
    () =>
      [
        filters.ageFilter !== 'any',
        filters.religionFilter !== 'any',
        filters.religionFilter === Religions.HINDU &&
          filters.casteFilter !== 'any',
        filters.verifiedOnly,
        filters.heightFilter !== 'any',
        filters.maritalStatusFilter !== 'any',
        filters.educationFilter !== 'any',
        filters.occupationTypeFilter !== 'any',
        filters.activityFilter !== 'any',
        filters.premiumOnly,
        filters.withPhotoOnly,
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
      TAB_CONFIG.filter(
        (tab) => tab.key !== 'curated' || hasCuratedMatches
      ).map((tab) => ({
        ...tab,
        count:
          tab.key === 'curated'
            ? (curatedPreview?.meta?.total ?? curatedPreview?.data?.length ?? 0)
            : tab.key === 'matched'
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
      curatedPreview?.data?.length,
      curatedPreview?.meta?.total,
      hasCuratedMatches,
      matches.length,
      requestMatches.length,
      shortlistedMatches.length,
    ]
  );

  // ─── Handlers ─────────────────────────────────────────────────────────

  const openNearbyTab = useCallback(() => {
    setNearbyLocationReady(false);
    setActiveTab('nearby');
    setPage(1);
  }, []);

  const enableNearbyLocationSharing = useCallback(async () => {
    if (nearbyPermissionPromptInFlight.current) {
      return;
    }

    nearbyPermissionPromptInFlight.current = true;

    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status === Location.PermissionStatus.UNDETERMINED) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        showError({
          title: t('matches.nearby_location_permission_title'),
          message: t('matches.nearby_location_permission_message'),
        });
        return;
      }

      dispatch(setLocationSharing(true));
      await updateLocalizationSettings({ shareLocation: true }).unwrap();
      openNearbyTab();
    } catch (error) {
      dispatch(setLocationSharing(false));
      showError({
        title: t('matches.nearby_location_enable_failed_title'),
        message: t('matches.nearby_location_enable_failed_message'),
      });

      if (__DEV__) {
        console.warn('[MatchList] nearby location enable failed:', error);
      }
    } finally {
      nearbyPermissionPromptInFlight.current = false;
    }
  }, [dispatch, openNearbyTab, t, updateLocalizationSettings]);

  const handleTabChange = useCallback(
    (key: TabKey) => {
      userSelectedTab.current = true;

      if (key === 'nearby' && !locationSharing) {
        showConfirm({
          title: t('matches.nearby_location_enable_title'),
          message: t('matches.nearby_location_enable_message'),
          confirmText: t('matches.nearby_location_enable_confirm'),
          cancelText: t('matches.nearby_location_enable_cancel'),
          onConfirm: () => {
            void enableNearbyLocationSharing();
          },
        });
        return;
      }

      setNearbyLocationReady(key !== 'nearby');
      setActiveTab(key);
      setPage(1);
    },
    [enableNearbyLocationSharing, locationSharing, t]
  );

  useEffect(() => {
    if (userSelectedTab.current) {
      return;
    }

    if (hasCuratedMatches && activeTab !== 'curated') {
      setActiveTab('curated');
      setPage(1);
      return;
    }

    if (!hasCuratedMatches && activeTab === 'curated') {
      setActiveTab('recommended');
      setPage(1);
    }
  }, [activeTab, hasCuratedMatches]);

  useEffect(() => {
    if (activeTab !== 'nearby') {
      setNearbyLocationReady(true);
      return;
    }

    if (!userId || !locationSharing || nearbyLocationInFlight.current) {
      setNearbyLocationReady(true);
      return;
    }

    let isCancelled = false;
    nearbyLocationInFlight.current = true;
    setNearbyLocationReady(false);

    const syncNearbyLocation = async () => {
      try {
        const deviceId = await getDeviceId();
        const storageKey = getLocationSyncKey(userId);
        const cached = await Storage.getItem<LocationSyncSnapshot>(storageKey);
        const now = Date.now();
        const sameDevice = cached?.deviceId === deviceId;
        const isFresh =
          cached !== null && now - cached.syncedAt < LOCATION_SYNC_TTL_MS;

        if (sameDevice && isFresh) {
          return;
        }

        let permission = await Location.getForegroundPermissionsAsync();
        if (permission.status === Location.PermissionStatus.UNDETERMINED) {
          permission = await Location.requestForegroundPermissionsAsync();
        }

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          showError({
            title: t('matches.nearby_location_permission_title'),
            message: t('matches.nearby_location_permission_message'),
          });
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isCancelled) {
          return;
        }

        const nextLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        const movedEnough =
          !cached ||
          !sameDevice ||
          distanceInMeters(
            {
              latitude: cached.latitude,
              longitude: cached.longitude,
            },
            nextLocation
          ) >= LOCATION_SYNC_DISTANCE_METERS;

        if (movedEnough) {
          await updateProfileLocation(nextLocation).unwrap();
        }

        await Storage.setItem<LocationSyncSnapshot>(storageKey, {
          ...nextLocation,
          deviceId,
          syncedAt: now,
        });
      } catch (error) {
        if (__DEV__) {
          console.warn('[MatchList] nearby location sync failed:', error);
        }
      } finally {
        nearbyLocationInFlight.current = false;
        if (!isCancelled) {
          setNearbyLocationReady(true);
        }
      }
    };

    void syncNearbyLocation();

    return () => {
      isCancelled = true;
      nearbyLocationInFlight.current = false;
    };
  }, [activeTab, locationSharing, t, updateProfileLocation, userId]);

  const handleFiltersChange = useCallback((patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleClearFilters = useCallback(() => {
    Keyboard.dismiss();

    setQuery('');

    setFilters(DEFAULT_FILTERS);
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

  const handleCloseMatchSuccessModal = useCallback(() => {
    setMatchedSuccessItem(null);
  }, []);

  const handleStartChatFromMatchSuccess = useCallback(async () => {
    if (!matchedSuccessItem) {
      return;
    }

    const item = matchedSuccessItem;
    setMatchedSuccessItem(null);
    await handleOpenChat(item);
  }, [handleOpenChat, matchedSuccessItem]);

  const listViewState = useMemo(
    () =>
      deriveMatchListViewState({
        isOffline: false,
        hasError: Boolean(activeError),
        isLoading: activeLoading,
        itemCount: filtered.length,
      }),
    [activeError, activeLoading, filtered.length]
  );

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
        onRejectRequest={() => {
          void handleRejectRequest(item);
        }}
        onDismissCurated={() => {
          void handleDismissCurated(item);
        }}
        onShortlist={() => {
          void handleShortlist(item);
        }}
      />
    ),
    [
      handleDismissCurated,
      handlePrimaryAction,
      handleRejectRequest,
      handleShortlist,
      navigation,
    ]
  );

  const ListHeader = useCallback(
    () => (
      <MatchListToolbar
        resultCount={filtered.length}
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearFilters}
      />
    ),
    [activeFilterCount, filtered.length, handleClearFilters]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header
        title={t('matches.title')}
        subtitle={t('matches.subtitle')}
        actions={[
          {
            icon: 'sliders',
            badge: activeFilterCount > 0,
            onPress: () => setShowFilters(true),
          },
        ]}
      />

      <MatchTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {listViewState === 'loading' ? (
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

      <MatchFilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={() => setShowFilters(false)}
        onClear={() => {
          handleClearFilters();
          setShowFilters(false);
        }}
      />

      <MatchSuccessModal
        visible={Boolean(matchedSuccessItem)}
        matchName={matchedSuccessItem?.name ?? ''}
        matchPhotoUrl={matchedSuccessItem?.avatarUrl ?? ''}
        myPhotoUrl={currentUserPhotoUrl ?? matchedSuccessItem?.avatarUrl ?? ''}
        onStartChat={() => {
          void handleStartChatFromMatchSuccess();
        }}
        onContinueBrowsing={handleCloseMatchSuccessModal}
        onClose={handleCloseMatchSuccessModal}
      />
    </SafeAreaView>
  );
}
