import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../core/components/Header';
import { Colors } from '../../core/constants/colors';
import { type RootNavigationProp } from '../../navigation/types';
import { type Profile } from '../../core/types/profile.types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { homeStyles } from './HomeScreen.styles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HomeScreenProps {
  navigation: RootNavigationProp;
}

interface ProfileCardProps {
  item: Profile;
  onChat: () => void;
  onView: () => void;
  onShortlist: () => void;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PROFILES: Profile[] = [
  {
    userId: '1',
    name: 'Gayatri',
    age: 39,
    height: '5\'4"',
    location: 'Pune, Maharashtra',
    religion: 'Hindu • Brahmin',
    education: 'MBA',
    profession: 'HR Manager',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
    ],
  },
  {
    userId: '2',
    name: 'Neha',
    age: 35,
    height: '5\'6"',
    location: 'Mumbai, Maharashtra',
    religion: 'Hindu • Maratha',
    education: 'B.Tech',
    profession: 'Software Engineer',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    ],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  const styles = useThemedStyles(homeStyles);

  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function ProfileCard({
  item,
  onChat,
  onView,
  onShortlist,
}: ProfileCardProps): React.ReactElement {
  const styles = useThemedStyles(homeStyles);

  return (
    <View style={styles.card}>
      <PhotoCarousel photos={item.photos} name={item.name} />

      {/* Photo count badge */}
      {item.photos.length > 1 && (
        <View style={styles.photoBadge}>
          <Feather name="image" size={12} color={Colors.white} />
          <Text style={styles.photoBadgeText}>{item.photos.length}</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {item.name}, {item.age}
          </Text>
          <View style={styles.verifiedBadge}>
            <Feather name="check-circle" size={14} color={Colors.primary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Feather name="map-pin" size={13} color={Colors.textMuted} />
          <Text style={styles.meta}>
            {item.height} • {item.location}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <InfoRow label="Education" value={item.education} />
          <InfoRow label="Profession" value={item.profession} />
          <InfoRow label="Religion" value={item.religion} />
        </View>

        {/* Action Buttons */}
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
            <Feather name="user" size={16} color={Colors.textPrimary} />
            <Text style={styles.viewText}>View Profile</Text>
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

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen({
  navigation,
}: HomeScreenProps): React.ReactElement {
  const styles = useThemedStyles(homeStyles);

  const handleChat = useCallback(
    (profile: Profile) => {
      navigation.navigate('Chats', { userId: profile.userId });
    },
    [navigation]
  );

  const handleView = useCallback(
    (profile: Profile) => {
      navigation.navigate('MatchDetail', { user: profile });
    },
    [navigation]
  );

  const handleShortlist = useCallback((profile: Profile) => {
    // TODO: dispatch shortlist action
    console.warn(`Shortlisted: ${profile.name}`);
  }, []);

  const renderProfile: ListRenderItem<Profile> = useCallback(
    ({ item }) => (
      <ProfileCard
        item={item}
        onChat={() => handleChat(item)}
        onView={() => handleView(item)}
        onShortlist={() => handleShortlist(item)}
      />
    ),
    [handleChat, handleView, handleShortlist]
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FlatList
        data={PROFILES}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderProfile}
      />
    </SafeAreaView>
  );
}
