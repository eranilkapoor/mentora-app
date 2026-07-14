import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DiscoveryProfile,
  InterestRecord,
  MatchRecord,
  useGetDiscoveryProfilesQuery,
  useGetMyMatchesQuery,
  useGetReceivedInterestsQuery,
  useGetSentInterestsQuery,
  useGetShortlistedProfilesQuery,
} from '@/store/services/matchApi.service';
import { PROFILE_FEED_PAGE_SIZE } from '@/core/constants';
import { mergeByKey, mapToMatchItem } from '../MatchList.utils';
import { FilterState, MatchItem, TabKey } from '../MatchList.types';
import { Religions } from '@/core/types';

export function useMatchListData(
  activeTab: TabKey,
  query: string,
  filters: FilterState,
  page: number,
  setPage: (n: number) => void,
  nearbyLocationReady = true
) {
  const { t } = useTranslation();

  const [discoveryProfiles, setDiscoveryProfiles] = useState<
    DiscoveryProfile[]
  >([]);
  const [acceptedMatchRecords, setAcceptedMatchRecords] = useState<
    MatchRecord[]
  >([]);
  const [shortlistedProfileRecords, setShortlistedProfileRecords] = useState<
    DiscoveryProfile[]
  >([]);
  const [receivedInterestRecords, setReceivedInterestRecords] = useState<
    InterestRecord[]
  >([]);

  const isDiscoveryTab =
    activeTab !== 'requests' &&
    activeTab !== 'shortlisted' &&
    activeTab !== 'matched';

  const selectedAgeFilter = useMemo(
    () =>
      [
        { key: 'any' as const },
        { key: '18-25' as const, minAge: 18, maxAge: 25 },
        { key: '26-32' as const, minAge: 26, maxAge: 32 },
        { key: '33-40' as const, minAge: 33, maxAge: 40 },
      ].find((f) => f.key === filters.ageFilter),
    [filters.ageFilter]
  );

  const discoveryFilters = useMemo(
    () => ({
      ...(query.trim() ? { search: query.trim() } : {}),
      ...(filters.cityFilter.trim() ? { city: filters.cityFilter.trim() } : {}),
      ...(filters.religionFilter === 'any'
        ? {}
        : { religion: filters.religionFilter }),
      ...(filters.religionFilter === Religions.HINDU &&
      filters.casteFilter !== 'any'
        ? { caste: filters.casteFilter }
        : {}),
      ...(filters.occupationTypeFilter === 'any'
        ? {}
        : { occupationType: filters.occupationTypeFilter }),
      ...(selectedAgeFilter && 'minAge' in selectedAgeFilter
        ? { minAge: selectedAgeFilter.minAge }
        : {}),
      ...(selectedAgeFilter && 'maxAge' in selectedAgeFilter
        ? { maxAge: selectedAgeFilter.maxAge }
        : {}),
      ...(filters.verifiedOnly ? { verifiedOnly: true } : {}),
    }),
    [filters, query, selectedAgeFilter]
  );

  // ─── Queries ──────────────────────────────────────────────────────────

  const { data, isLoading, isFetching, refetch, error } =
    useGetDiscoveryProfilesQuery(
      {
        type: activeTab as never,
        page,
        limit: PROFILE_FEED_PAGE_SIZE,
        radiusKm: 100,
        ...discoveryFilters,
      },
      {
        skip:
          !isDiscoveryTab || (activeTab === 'nearby' && !nearbyLocationReady),
      }
    );

  const {
    data: myMatches,
    isFetching: isFetchingMyMatches,
    isLoading: isLoadingMyMatches,
    refetch: refetchMyMatches,
    error: myMatchesError,
  } = useGetMyMatchesQuery(
    { page, limit: PROFILE_FEED_PAGE_SIZE },
    { skip: activeTab !== 'matched' }
  );

  const {
    data: shortlistedProfiles,
    isLoading: isLoadingShortlisted,
    isFetching: isFetchingShortlisted,
    refetch: refetchShortlisted,
    error: shortlistedError,
  } = useGetShortlistedProfilesQuery(
    { page, limit: PROFILE_FEED_PAGE_SIZE },
    { skip: activeTab !== 'shortlisted' }
  );

  const { data: shortlistedStatus, refetch: refetchShortlistedStatus } =
    useGetShortlistedProfilesQuery(
      { limit: 100 },
      { skip: activeTab === 'shortlisted' }
    );

  const { data: sentInterests, refetch: refetchSentInterests } =
    useGetSentInterestsQuery({ limit: 100 });

  const {
    data: receivedInterests,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
    refetch: refetchReceivedInterests,
    error: receivedInterestsError,
  } = useGetReceivedInterestsQuery(
    { page, limit: PROFILE_FEED_PAGE_SIZE },
    { skip: activeTab !== 'requests' }
  );

  // ─── Reset on tab/filter change ───────────────────────────────────────

  useEffect(() => {
    setPage(1);
    setDiscoveryProfiles([]);
    setAcceptedMatchRecords([]);
    setShortlistedProfileRecords([]);
    setReceivedInterestRecords([]);
  }, [activeTab, filters, query, setPage]);

  // ─── Accumulate pages ─────────────────────────────────────────────────

  useEffect(() => {
    if (!data?.data || !isDiscoveryTab) return;
    setDiscoveryProfiles((curr) =>
      page === 1 ? data.data : mergeByKey(curr, data.data, (p) => p.userId)
    );
  }, [data, page, isDiscoveryTab]);

  useEffect(() => {
    if (!myMatches?.data || activeTab !== 'matched') return;
    setAcceptedMatchRecords((curr) =>
      page === 1
        ? myMatches.data
        : mergeByKey(curr, myMatches.data, (m) => m._id)
    );
  }, [myMatches, page, activeTab]);

  useEffect(() => {
    if (!shortlistedProfiles?.data || activeTab !== 'shortlisted') return;
    setShortlistedProfileRecords((curr) =>
      page === 1
        ? shortlistedProfiles.data
        : mergeByKey(curr, shortlistedProfiles.data, (p) => p.userId)
    );
  }, [shortlistedProfiles, page, activeTab]);

  useEffect(() => {
    if (!receivedInterests?.data || activeTab !== 'requests') return;
    setReceivedInterestRecords((curr) =>
      page === 1
        ? receivedInterests.data
        : mergeByKey(curr, receivedInterests.data, (i) => i._id)
    );
  }, [receivedInterests, page, activeTab]);

  // ─── Derived sets ─────────────────────────────────────────────────────

  const matchedIds = useMemo(() => {
    const ids = new Set<string>();
    myMatches?.data?.forEach((m) => {
      ids.add(String(m.userId));
      ids.add(String(m.targetUserId));
    });
    return ids;
  }, [myMatches]);

  const shortlistedIds = useMemo(
    () =>
      new Set(
        (activeTab === 'shortlisted'
          ? shortlistedProfileRecords
          : (shortlistedStatus?.data ?? [])
        ).map((p) => p.userId)
      ),
    [activeTab, shortlistedProfileRecords, shortlistedStatus]
  );

  const pendingInterestByUserId = useMemo(() => {
    const pending = new Map<string, string>();
    sentInterests?.data?.forEach((interest) => {
      if (interest.status === 'pending') {
        pending.set(String(interest.receiverId), interest._id);
      }
    });
    return pending;
  }, [sentInterests]);

  // ─── Mapped items ─────────────────────────────────────────────────────

  const mapper = (profile: DiscoveryProfile) =>
    mapToMatchItem(
      profile,
      matchedIds,
      shortlistedIds,
      pendingInterestByUserId,
      t
    );

  const matches = useMemo(
    () => discoveryProfiles.map(mapper),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [discoveryProfiles, matchedIds, pendingInterestByUserId, shortlistedIds]
  );

  const shortlistedMatches = useMemo(
    () => shortlistedProfileRecords.map(mapper),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      shortlistedProfileRecords,
      matchedIds,
      pendingInterestByUserId,
      shortlistedIds,
    ]
  );

  const acceptedMatches = useMemo(
    () =>
      acceptedMatchRecords
        .filter((m) => m.profile)
        .map((m) => mapper(m.profile as DiscoveryProfile)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [acceptedMatchRecords, matchedIds, pendingInterestByUserId, shortlistedIds]
  );

  const requestMatches = useMemo(
    () =>
      receivedInterestRecords
        .filter((i) => i.status === 'pending' && i.profile)
        .map((interest) => ({
          ...mapper(interest.profile as DiscoveryProfile),
          id: String(interest.senderId),
          interestId: interest._id,
          requestStatus: interest.status,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      receivedInterestRecords,
      matchedIds,
      pendingInterestByUserId,
      shortlistedIds,
    ]
  );

  const visibleMatches: MatchItem[] =
    activeTab === 'requests'
      ? requestMatches
      : activeTab === 'shortlisted'
        ? shortlistedMatches
        : activeTab === 'matched'
          ? acceptedMatches
          : matches;

  const activeMeta =
    activeTab === 'requests'
      ? receivedInterests?.meta
      : activeTab === 'shortlisted'
        ? shortlistedProfiles?.meta
        : activeTab === 'matched'
          ? myMatches?.meta
          : data?.meta;

  const activeLoading =
    activeTab === 'requests'
      ? isLoadingRequests
      : activeTab === 'shortlisted'
        ? isLoadingShortlisted
        : activeTab === 'matched'
          ? isLoadingMyMatches
          : isLoading;

  const activeFetching =
    activeTab === 'requests'
      ? isFetchingRequests
      : activeTab === 'shortlisted'
        ? isFetchingShortlisted
        : activeTab === 'matched'
          ? isFetchingMyMatches
          : isFetching;

  const activeError =
    activeTab === 'requests'
      ? receivedInterestsError
      : activeTab === 'shortlisted'
        ? shortlistedError
        : activeTab === 'matched'
          ? myMatchesError
          : error;

  return {
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
  };
}
