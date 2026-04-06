import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { Colors } from '../../core/constants/colors';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { onlineMatchesStyles } from './OnlineMatchesScreen.styles';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  Chat: { partnerId: string; partnerName: string };
  ProfileDetail: { userId: string };
};

type Props = {
  navigation: NavigationProp<RootStackParamList>;
};

type OnlineMatch = {
  id: string;
  name: string;
  age: number;
  height: string;
  education: string;
  profession: string;
  city: string;
  photo: string;
  isOnline: boolean;
  isNew?: boolean;
};

interface MatchCardProps {
  item: OnlineMatch;
  onChat: () => void;
  onViewProfile: () => void;
}

// ─── Mock API ─────────────────────────────────────────────────────────────────

const mockFetchOnlineMatches = (): Promise<OnlineMatch[]> =>
  new Promise<OnlineMatch[]>((resolve) =>
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: 'Priya Sharma',
          age: 27,
          height: '5\'4"',
          education: 'MBA',
          profession: 'HR Manager',
          city: 'Delhi',
          photo: 'https://i.pravatar.cc/300?img=11',
          isOnline: true,
          isNew: true,
        },
        {
          id: '2',
          name: 'Ankit Verma',
          age: 30,
          height: '5\'9"',
          education: 'B.Tech',
          profession: 'Software Engineer',
          city: 'Bangalore',
          photo: 'https://i.pravatar.cc/300?img=12',
          isOnline: true,
          isNew: false,
        },
        {
          id: '3',
          name: 'Meera Nair',
          age: 25,
          height: '5\'2"',
          education: 'B.Com',
          profession: 'Chartered Accountant',
          city: 'Kochi',
          photo: 'https://i.pravatar.cc/300?img=47',
          isOnline: false,
          isNew: true,
        },
      ]);
    }, 600)
  );

// ─── Match Card ───────────────────────────────────────────────────────────────

const MatchCard: React.FC<MatchCardProps> = ({
  item,
  onChat,
  onViewProfile,
}) => {
  const styles = useThemedStyles(onlineMatchesStyles);

  return (
    <View style={styles.card}>
      {/* Photo */}
      <View style={styles.photoWrapper}>
        <Image
          source={{ uri: item.photo }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.photoScrim} />

        {/* Top badges */}
        <View style={styles.badgeRow}>
          {item.isOnline && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineBadgeText}>Online now</Text>
            </View>
          )}
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        {/* Name overlay */}
        <View style={styles.nameOverlay}>
          <Text style={styles.nameOverlayText}>
            {item.name}, {item.age}
          </Text>
          <Text style={styles.cityOverlayText}>📍 {item.city}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.tagsRow}>
          {[item.height, item.education, item.profession].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={onChat}
            activeOpacity={0.85}
          >
            <Text style={styles.chatText}>💬 Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={onViewProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.profileText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnlineMatchesScreen({ navigation }: Props) {
  const styles = useThemedStyles(onlineMatchesStyles);

  const [matches, setMatches] = useState<OnlineMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    const data = await mockFetchOnlineMatches();
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const onlineCount = matches.filter((m) => m.isOnline).length;

  const renderItem: ListRenderItem<OnlineMatch> = ({ item }) => (
    <MatchCard
      item={item}
      onChat={() =>
        navigation.navigate('Chat', {
          partnerId: item.id,
          partnerName: item.name,
        })
      }
      onViewProfile={() =>
        navigation.navigate('ProfileDetail', { userId: item.id })
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Online Matches</Text>
          {!loading && (
            <Text style={styles.headerSub}>
              <Text style={styles.onlineCountText}>{onlineCount} online</Text> ·{' '}
              {matches.length} total profiles
            </Text>
          )}
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding who's online…</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🕊️</Text>
          <Text style={styles.emptyTitle}>No one online right now</Text>
          <Text style={styles.emptySub}>Check back in a bit!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
