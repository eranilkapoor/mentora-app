import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

type Match = {
  id: string;
  name: string;
  age: number;
  height: string;
  religion: string;
  caste: string;
  education: string;
  profession: string;
  location: string;
  avatarUrl: string;
};

type Props = {
  navigation: any;
};

/* ---------- MOCK API ---------- */
const mockFetchMatches = async (): Promise<Match[]> => {
  await new Promise((r) => setTimeout(r, 700));
  return [
    {
      id: "1",
      name: "Priya Sharma",
      age: 28,
      height: "5'4\"",
      religion: "Hindu",
      caste: "Brahmin",
      education: "B.Tech",
      profession: "Software Engineer",
      location: "Mumbai, India",
      avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: "2",
      name: "Anjali Verma",
      age: 26,
      height: "5'2\"",
      religion: "Hindu",
      caste: "Kayastha",
      education: "MBA",
      profession: "HR Manager",
      location: "Delhi, India",
      avatarUrl: "https://randomuser.me/api/portraits/women/66.jpg",
    },
  ];
};

const MatchListScreen: React.FC<Props> = ({ navigation }) => {
  const [matches, setMatches] = useState<Match[]>([]);
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

  const renderItem = ({ item }: { item: Match }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.avatarUrl }} style={styles.photo} />

      <View style={styles.info}>
        <Text style={styles.name}>
          {item.name}, {item.age}
        </Text>

        <Text style={styles.sub}>
          {item.height} • {item.religion}, {item.caste}
        </Text>

        <Text style={styles.sub}>
          {item.education} • {item.profession}
        </Text>

        <Text style={styles.location}>{item.location}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() =>
              navigation.navigate("OnlineMatches", { userId: item.id })
            }
          >
            <Text style={styles.outlineText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("ChatScreen", { user: item })
            }
          >
            <Text style={styles.primaryText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider style={styles.container}>
      {/* SEARCH */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search by name"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No matches found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaProvider>
  );
};

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  searchBox: {
    padding: 12,
    backgroundColor: "#fff",
  },
  searchInput: {
    height: 42,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },

  photo: {
    width: "100%",
    height: 220,
  },

  info: {
    padding: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  sub: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },

  location: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },

  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  outlineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e91e63",
    alignItems: "center",
  },

  outlineText: {
    color: "#e91e63",
    fontWeight: "600",
  },

  primaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e91e63",
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#666",
  },
});

export default MatchListScreen;
