import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ListRenderItem,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import HomeHeader from '../../components/HomeHeader';
import { Colors } from '../../constants/colors';
import { type RootNavigationProp } from '../../navigation/types';
import { type Profile } from '../../types/profile.types';

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

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 24;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PROFILES: Profile[] = [
  {
    id: '1',
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
    id: '2',
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
  const renderPhoto: ListRenderItem<string> = useCallback(
    ({ item }) => (
      <Image
        source={{ uri: item }}
        style={styles.photo}
        accessibilityLabel={`Photo of ${name}`}
      />
    ),
    [name]
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
  const handleChat = useCallback(
    (profile: Profile) => {
      navigation.navigate('ChatScreen', { user: profile });
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
    <SafeAreaProvider style={styles.container}>
      <HomeHeader />
      <FlatList
        data={PROFILES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderProfile}
      />
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPage,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  photo: {
    width: CARD_WIDTH,
    height: 320,
    resizeMode: 'cover',
  },
  photoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.overlayDark,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  photoBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  meta: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  infoGrid: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.chatBtn,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chatText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  shortlistBtn: {
    width: 48,
    backgroundColor: Colors.shortlistBg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
