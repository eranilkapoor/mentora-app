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
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { homeStyles } from './Home.styles';
import Header from '../../core/components/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { type MatchProfile } from '../../core/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  MatchDetails: { userId: string };
  ChatDetails: {
    userId: string;
    partnerName: string;
    partnerPhoto: string;
  };
  Matches: undefined;
  Notifications: undefined;
  Filters: undefined;
};

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PROFILES: MatchProfile[] = [
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
  item: MatchProfile;
  onChat: () => void;
  onView: () => void;
  onShortlist: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();

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
          {[item.height, item.religion, item.education].map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
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
            onPress={onChat}
            accessibilityRole="button"
            accessibilityLabel={`Chat with ${item.name}`}
          >
            <Feather
              name="message-circle"
              size={16}
              color={theme.colors.white}
            />
            <Text style={styles.chatText}>Chat</Text>
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

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen({
  navigation,
}: HomeScreenProps): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const renderProfile: ListRenderItem<MatchProfile> = useCallback(
    ({ item }) => (
      <ProfileCard
        item={item}
        onChat={() =>
          navigation.navigate('ChatDetails', {
            userId: item.userId,
            partnerName: item.name,
            partnerPhoto: item.photos[0],
          })
        }
        onView={() =>
          navigation.navigate('MatchDetails', { userId: item.userId })
        }
        onShortlist={() => console.warn(`Shortlisted: ${item.name}`)}
      />
    ),
    [navigation]
  );

  const ListHeader = useCallback(
    () => (
      <>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'heart', value: '24', label: 'New Matches' },
            { icon: 'eye', value: '12', label: 'Profile Views' },
            { icon: 'star', value: '8', label: 'Interests' },
            { icon: 'message-circle', value: '3', label: 'Unread' },
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

        {/* Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.suggested')}</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('Matches')}
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
    [styles, navigation, theme.colors.primary, t]
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
            onPress: () => navigation.navigate('Filters'),
          },
        ]}
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
