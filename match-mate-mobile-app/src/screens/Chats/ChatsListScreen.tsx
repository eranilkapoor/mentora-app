import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockFetchMatches = async () => {
  await new Promise((r) => setTimeout(r, 700));
  return [
    {
      id: "1",
      name: "Priya Sharma",
      age: 28,
      city: "Mumbai",
      lastMessage: "Hi, how are you?",
      avatarUrl: "https://i.pravatar.cc/150?img=10",
      matchedAt: new Date().toISOString(),
      isOnline: true,
      unreadCount: 2,
    },
    {
      id: "2",
      name: "Ankit Verma",
      age: 31,
      city: "Delhi",
      lastMessage: "Thanks for accepting",
      avatarUrl: "https://i.pravatar.cc/150?img=11",
      matchedAt: new Date(Date.now() - 3600000).toISOString(),
      isOnline: false,
      unreadCount: 0,
    },
  ];
};

const ChatListScreen = ({ navigation }: any) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    const data = await mockFetchMatches();
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const filtered = matches.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ChatScreen", { userId: item.id })
        }
      >
        <View style={styles.avatarWrap}>
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {item.name}, {item.age}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>

          <Text style={styles.subText}>{item.city}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || "Start conversation"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search by name"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  searchBox: {
    padding: 12,
  },

  searchInput: {
    height: 40,
    backgroundColor: "#f1f3f6",
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  card: {
    flexDirection: "row",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },

  avatarWrap: {
    marginRight: 12,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2ecc71",
    borderWidth: 2,
    borderColor: "#fff",
  },

  info: {
    flex: 1,
    justifyContent: "center",
  },

  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  subText: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  lastMessage: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
  },

  badge: {
    backgroundColor: "#e53935",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
