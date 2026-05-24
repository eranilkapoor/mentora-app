import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ListRenderItem,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../core/components/Header';
import { MatchProfile } from '../../core/types';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { resolveApiUrl } from '@/core/utils/config';
import { HomeStackParamList } from '@/navigation/types';
import { homeStyles } from './Home.styles';
import { useCreateDirectRoomMutation } from '@/store/services/chatApi.service';
import {
  DiscoveryProfile,
  useGetDiscoveryProfilesQuery,
  useGetMyMatchesQuery,
  useSendInterestMutation,
} from '@/store/services/matchApi.service';

type HomeMatchProfile = MatchProfile & {
  isMatched: boolean;
};

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;
}

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600';

const isRecentlyActive = (lastActiveAt?: string): boolean =>
  lastActiveAt
    ? Date.now() - new Date(lastActiveAt).getTime() <= 15 * 60 * 1000
    : false;

const isNewProfile = (createdAt?: string): boolean =>
  createdAt
    ? Date.now() - new Date(createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000
    : false;

const profileName = (profile: DiscoveryProfile): string =>
  [profile.personal?.firstName, profile.personal?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'MatchMate Member';

const mapProfile = (
  profile: DiscoveryProfile,
  matchedIds: Set<string>
): HomeMatchProfile => {
  const photos =
    profile.images
      ?.filter((image) => image.isActive !== false)
      .sort(
        (a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary))
      )
      .map((image) => resolveApiUrl(image.url))
      .filter((url): url is string => Boolean(url)) ?? [];

  return {
    userId: profile.userId,
    name: profileName(profile),
    age: profile.age ?? 0,
    height: String(profile.physical?.height ?? '-'),
    location:
      [profile.personal?.city, profile.personal?.state]
        .filter(Boolean)
        .join(', ') || '-',
    religion: [profile.personal?.religion, profile.personal?.caste]
      .filter(Boolean)
      .join(' - '),
    education: profile.education?.qualification ?? '-',
    profession:
      profile.education?.jobRole ?? profile.education?.occupation ?? '-',
    isOnline: isRecentlyActive(profile.lastActiveAt),
    isNew: isNewProfile(profile.createdAt),
    photos: photos.length > 0 ? photos : [FALLBACK_PHOTO],
    isMatched: matchedIds.has(profile.userId),
  };
};

function PhotoCarousel({
  photos,
  name,
}: {
  photos: string[];
  name: string;
}): React.ReactElement {
  const styles = useThemedStyles(homeStyles);

  const renderPhoto: ListRenderItem<string> = useCallback(
    ({ item }) => (
      <Image
        source={{ uri: item }}
        style={styles.photo}
        resizeMode="cover"
        accessibilityLabel={`Photo of ${name}`}
      />
    ),
    [name, styles]
  );

  return (
    <FlatList
      data={photos}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, i) => i.toString()}
      renderItem={renderPhoto}
    />
  );
}

function ProfileCard({
  item,
  onPrimaryAction,
  onView,
  onShortlist,
}: {
  item: HomeMatchProfile;
  onPrimaryAction: () => void;
  onView: () => void;
  onShortlist: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.card}>
      <View style={styles.photoWrapper}>
        <PhotoCarousel photos={item.photos} name={item.name} />
        <View style={styles.photoScrim} />

        {item.isOnline === true && (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineBadgeText}>Online</Text>
          </View>
        )}

        {item.isNew === true && (
          <View
            style={[
              styles.newBadge,
              item.isOnline ? styles.newBadgeOnline : styles.newBadgeDefault,
            ]}
          >
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}

        {item.photos.length > 1 && (
          <View style={styles.photoBadge}>
            <Feather name="image" size={11} color={theme.colors.white} />
            <Text style={styles.photoBadgeText}>{item.photos.length}</Text>
          </View>
        )}

        <View style={styles.photoOverlay}>
          <Text style={styles.heroName}>
            {item.name}, {item.age || '-'}
          </Text>
          <View style={styles.heroLocationRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroLocation}>{item.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.tagsRow}>
          {[item.height, item.religion || '-', item.education].map(
            (tag, index) => (
              <View key={`${tag}-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            )
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather
              name="briefcase"
              size={13}
              color={theme.colors.textMuted}
            />
            <Text style={styles.meta}>{item.profession}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={onPrimaryAction}
            accessibilityRole="button"
            accessibilityLabel={
              item.isMatched
                ? `Chat with ${item.name}`
                : `Send interest to ${item.name}`
            }
          >
            <Feather
              name={item.isMatched ? 'message-circle' : 'heart'}
              size={16}
              color={theme.colors.white}
            />
            <Text style={styles.chatText}>
              {item.isMatched ? 'Chat' : 'Interest'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewBtn}
            onPress={onView}
            accessibilityRole="button"
            accessibilityLabel={`View ${item.name}'s profile`}
          >
            <Feather name="user" size={16} color={theme.colors.primary} />
            <Text style={styles.viewText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortlistBtn}
            onPress={onShortlist}
            accessibilityRole="button"
            accessibilityLabel={`Shortlist ${item.name}`}
          >
            <Feather name="bookmark" size={18} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen({
  navigation,
}: HomeScreenProps): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const { data, refetch, isFetching } = useGetDiscoveryProfilesQuery({
    type: 'recommended',
    limit: 10,
  });
  const { data: myMatches, refetch: refetchMatches } = useGetMyMatchesQuery();
  const [sendInterest] = useSendInterestMutation();
  const [createDirectRoom] = useCreateDirectRoomMutation();

  const matchedIds = useMemo(() => {
    const ids = new Set<string>();
    myMatches?.data?.forEach((match) => {
      ids.add(String(match.userId));
      ids.add(String(match.targetUserId));
    });
    return ids;
  }, [myMatches]);

  const profiles = useMemo(
    () => (data?.data ?? []).map((profile) => mapProfile(profile, matchedIds)),
    [data, matchedIds]
  );

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchMatches()]);
    setRefreshing(false);
  }, [refetch, refetchMatches]);

  const handlePrimaryAction = useCallback(
    async (item: HomeMatchProfile): Promise<void> => {
      if (!item.isMatched) {
        try {
          await sendInterest({ receiverId: item.userId }).unwrap();
          Alert.alert('Interest sent', `${item.name} will be notified.`);
        } catch {
          Alert.alert('Interest not sent', 'Please try again later.');
        }
        return;
      }

      try {
        await createDirectRoom({ targetUserId: item.userId }).unwrap();
        navigation.navigate('ChatDetails', {
          userId: item.userId,
          partnerName: item.name,
          partnerPhoto: item.photos[0],
        });
      } catch {
        Alert.alert(
          'Chat unavailable',
          'You can chat after both users have accepted the match.'
        );
      }
    },
    [createDirectRoom, navigation, sendInterest]
  );

  const renderProfile: ListRenderItem<HomeMatchProfile> = useCallback(
    ({ item }) => (
      <ProfileCard
        item={item}
        onPrimaryAction={() => {
          void handlePrimaryAction(item);
        }}
        onView={() =>
          navigation.navigate('MatchDetails', { userId: item.userId })
        }
        onShortlist={() => console.warn(`Shortlisted: ${item.name}`)}
      />
    ),
    [handlePrimaryAction, navigation]
  );

  const ListHeader = useCallback(
    () => (
      <>
        <View style={styles.statsRow}>
          {[
            {
              icon: 'heart',
              value: String(profiles.length),
              label: 'Suggested',
            },
            {
              icon: 'message-circle',
              value: String(myMatches?.data?.length ?? 0),
              label: 'Accepted',
            },
            {
              icon: 'wifi',
              value: String(profiles.filter((p) => p.isOnline).length),
              label: 'Online',
            },
            {
              icon: 'star',
              value: String(profiles.filter((p) => p.isNew).length),
              label: 'New',
            },
          ].map((stat, index) => (
            <View key={`${stat.label}-${index}`} style={styles.statCard}>
              <Feather
                name={stat.icon}
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.suggested')}</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.getParent()?.navigate('Matches')}
          >
            <Text style={styles.seeAllText}>{t('common.see_all')}</Text>
            <Feather
              name="chevron-right"
              size={14}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </>
    ),
    [myMatches, navigation, profiles, styles, theme.colors.primary, t]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        enableSearch
        searchPlaceholder={t('home.search_placeholder')}
        actions={[
          {
            icon: 'bell',
            badge: true,
            onPress: () => navigation.navigate('Notifications'),
          },
          {
            icon: 'sliders',
            onPress: () => navigation.getParent()?.navigate('Matches'),
          },
        ]}
      />

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderProfile}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyIconWrapper}>
              <Feather name="heart" size={36} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{t('home.empty_title')}</Text>
            <Text style={styles.emptySub}>{t('home.empty_subtitle')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
