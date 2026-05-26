import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DiscoveryProfile,
  useGetDiscoveryProfilesQuery,
  useGetMyMatchesQuery,
  useGetSentInterestsQuery,
  useGetShortlistedProfilesQuery,
} from '@/store/services/matchApi.service';
import { FEED_PAGE_SIZE } from '../Home.constants';
import { mapProfile } from '../Home.utils';
import { HomeMatchProfile } from '../Home.types';

export function useHomeData(query: string) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [feedProfiles, setFeedProfiles] = useState<DiscoveryProfile[]>([]);

  const discoveryQuery = useMemo(
    () => ({
      type: 'recommended' as const,
      page,
      limit: FEED_PAGE_SIZE,
      ...(query.trim() ? { search: query.trim() } : {}),
    }),
    [page, query]
  );

  const { data, refetch, isFetching } =
    useGetDiscoveryProfilesQuery(discoveryQuery);
  const { data: myMatches, refetch: refetchMatches } = useGetMyMatchesQuery();
  const { data: sentInterests, refetch: refetchSentInterests } =
    useGetSentInterestsQuery({ limit: 100 });
  const { data: shortlisted, refetch: refetchShortlisted } =
    useGetShortlistedProfilesQuery({ limit: 100 });

  // Reset feed on new search
  useEffect(() => {
    setPage(1);
    setFeedProfiles([]);
  }, [query]);

  // Accumulate pages — deduplicate by userId
  useEffect(() => {
    if (!data?.data) return;
    setFeedProfiles((current) => {
      if (page === 1) return data.data;
      const byUserId = new Map(current.map((p) => [p.userId, p]));
      data.data.forEach((p) => byUserId.set(p.userId, p));
      return [...byUserId.values()];
    });
  }, [data, page]);

  // Derived sets for O(1) lookups
  const matchedIds = useMemo(() => {
    const ids = new Set<string>();
    myMatches?.data?.forEach((m) => {
      ids.add(String(m.userId));
      ids.add(String(m.targetUserId));
    });
    return ids;
  }, [myMatches]);

  const shortlistedIds = useMemo(
    () => new Set((shortlisted?.data ?? []).map((p) => p.userId)),
    [shortlisted]
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

  const profiles = useMemo<HomeMatchProfile[]>(
    () =>
      feedProfiles.map((p) =>
        mapProfile(p, matchedIds, shortlistedIds, pendingInterestByUserId, t)
      ),
    [feedProfiles, matchedIds, shortlistedIds, pendingInterestByUserId, t]
  );

  const hasNextPage = data?.meta?.hasNextPage ?? false;

  return {
    profiles,
    myMatches,
    isFetching,
    page,
    setPage,
    hasNextPage,
    refetch,
    refetchMatches,
    refetchShortlisted,
    refetchSentInterests,
  };
}
