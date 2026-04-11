import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../core/constants/colors';
import { type Profile } from '../../core/types/profile.types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { homeStyles } from './HomeScreen.styles';
import Header from '../../core/components/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  MatchDetail: { userId: string };
  ChatScreen: { userId: string; partnerName: string; partnerPhoto: string };
};

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PROFILES: Profile[] = [
  {
    userId: '1',
    name: 'Gayatri',
    age: 29,
    height: '5\'4"',
    location: 'Pune, Maharashtra',
    religion: 'Hindu • Brahmin',
    education: 'MBA',
    profession: 'HR Manager',
    isOnline: true,
    isNew: true,
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
    ],
  },
  {
    userId: '2',
    name: 'Neha',
    age: 27,
    height: '5\'6"',
    location: 'Mumbai, Maharashtra',
    religion: 'Hindu • Maratha',
    education: 'B.Tech',
    profession: 'Software Engineer',
    isOnline: false,
    isNew: false,
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    ],
  },
];

// ─── Photo Carousel ───────────────────────────────────────────────────────────

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

// ─── Profile Card ─────────────────────────────────────────────────────────────

function ProfileCard({
  item,
  onChat,
  onView,
  onShortlist,
}: {
  item: Profile;
  onChat: () => void;
  onView: () => void;
  onShortlist: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(homeStyles);

  return (
    <View style={styles.card}>
      {/* Photo */}
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
            style={[styles.newBadge, item.isOnline ? { top: 44 } : { top: 12 }]}
          >
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}

        {item.photos.length > 1 && (
          <View style={styles.photoBadge}>
            <Feather name="image" size={11} color={Colors.white} />
            <Text style={styles.photoBadgeText}>{item.photos.length}</Text>
          </View>
        )}

        <View style={styles.photoOverlay}>
          <Text style={styles.heroName}>
            {item.name}, {item.age}
          </Text>
          <View style={styles.heroLocationRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroLocation}>{item.location}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.tagsRow}>
          {[item.height, item.religion, item.education].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="briefcase" size={13} color={Colors.textMuted} />
            <Text style={styles.meta}>{item.profession}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={onChat}
            accessibilityRole="button"
            accessibilityLabel={`Chat with ${item.name}`}
          >
            <Feather name="message-circle" size={16} color={Colors.white} />
            <Text style={styles.chatText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewBtn}
            onPress={onView}
            accessibilityRole="button"
            accessibilityLabel={`View ${item.name}'s profile`}
          >
            <Feather name="user" size={16} color={Colors.primary} />
            <Text style={styles.viewText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortlistBtn}
            onPress={onShortlist}
            accessibilityRole="button"
            accessibilityLabel={`Shortlist ${item.name}`}
          >
            <Feather name="bookmark" size={18} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard(): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonPhoto} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        <View style={[styles.skeletonLine, styles.skeletonLineXShort]} />
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen({
  navigation,
}: HomeScreenProps): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const renderProfile: ListRenderItem<Profile> = useCallback(
    ({ item }) => (
      <ProfileCard
        item={item}
        onChat={() =>
          navigation.navigate('ChatScreen', {
            userId: item.userId,
            partnerName: item.name,
            partnerPhoto: item.photos[0],
          })
        }
        onView={() =>
          navigation.navigate('MatchDetail', { userId: item.userId })
        }
        onShortlist={() => console.warn(`Shortlisted: ${item.name}`)}
      />
    ),
    [navigation]
  );

  const ListHeader = useCallback(
    () => (
      <>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'heart', value: '24', label: 'New Matches' },
            { icon: 'eye', value: '12', label: 'Profile Views' },
            { icon: 'star', value: '8', label: 'Interests' },
            { icon: 'message-circle', value: '3', label: 'Unread' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Feather name={stat.icon} size={16} color={Colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested for You</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('Matches' as never)}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Feather name="chevron-right" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </>
    ),
    [styles, navigation]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        onFilter={() => {}}
        onNotifications={() => navigation.navigate('Notifications' as never)}
        hasUnread
      />

      <FlatList
        data={PROFILES}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderProfile}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyIconWrapper}>
              <Feather name="heart" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No suggestions yet</Text>
            <Text style={styles.emptySub}>
              Complete your profile to start getting matches.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
