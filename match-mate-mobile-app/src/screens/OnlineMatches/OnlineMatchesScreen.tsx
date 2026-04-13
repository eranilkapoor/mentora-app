import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { onlineMatchesStyles } from './OnlineMatchesScreen.styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  Chats: { userId: string; partnerName: string; partnerPhoto: string };
  MatchDetail: { userId: string };
};

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockFetchOnlineMatches = (): Promise<OnlineMatch[]> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
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
        ]),
      600
    )
  );

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard(): React.ReactElement {
  const styles = useThemedStyles(onlineMatchesStyles);
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonPhoto} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
      </View>
    </View>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────

const MatchCard = React.memo(function MatchCard({
  item,
  onChat,
  onViewProfile,
}: {
  item: OnlineMatch;
  onChat: () => void;
  onViewProfile: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(onlineMatchesStyles);

  return (
    <View style={styles.card}>
      <View style={styles.photoWrapper}>
        <Image
          source={{ uri: item.photo }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.photoScrim} />

        <View style={styles.badgeRow}>
          {item.isOnline && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineBadgeText}>Online now</Text>
            </View>
          )}
          {item.isNew === true && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        <View style={styles.nameOverlay}>
          <Text style={styles.nameOverlayText}>
            {item.name}, {item.age}
          </Text>
          <View style={styles.cityOverlayRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.cityOverlayText}>{item.city}</Text>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.tagsRow}>
          {[item.height, item.education, item.profession].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={onChat}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Feather name="message-circle" size={15} color={Colors.white} />
            <Text style={styles.chatText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={onViewProfile}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Feather name="user" size={15} color={Colors.primary} />
            <Text style={styles.profileText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function OnlineMatchesScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(onlineMatchesStyles);
  const [matches, setMatches] = useState<OnlineMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async (): Promise<void> => {
    setLoading(true);
    const data = await mockFetchOnlineMatches();
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const onlineCount = matches.filter((m) => m.isOnline).length;

  const renderItem: ListRenderItem<OnlineMatch> = useCallback(
    ({ item }) => (
      <MatchCard
        item={item}
        onChat={() =>
          navigation.navigate('Chats', {
            userId: item.id,
            partnerName: item.name,
            partnerPhoto: item.photo,
          })
        }
        onViewProfile={() =>
          navigation.navigate('MatchDetail', { userId: item.id })
        }
      />
    ),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrapper}>
            <Feather name="wifi" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Online Now</Text>
            {!loading && (
              <Text style={styles.headerSub}>
                <Text style={styles.onlineCountText}>{onlineCount} online</Text>
                {' · '}
                {matches.length} total
              </Text>
            )}
          </View>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* ── Content ──────────────────────────────────────────────── */}
      {loading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      ) : matches.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconWrapper}>
            <Feather name="wifi-off" size={34} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No one online right now</Text>
          <Text style={styles.emptySub}>
            Check back in a bit — matches go online throughout the day.
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={8}
        />
      )}
    </SafeAreaView>
  );
}
