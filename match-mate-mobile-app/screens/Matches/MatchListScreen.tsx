import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    age?: number;
    lastMessage?: string;
    avatarUrl?: string;
    matchedAt?: string; // ISO string
};

type Props = {
    navigation: any;
};

const mockFetchMatches = async (): Promise<Match[]> => {
// simulate network
await new Promise((r) => setTimeout(r, 700));
return [
    {
        id: "1",
        name: "Alex Johnson",
        age: 29,
        lastMessage: "Had a great time!",
        avatarUrl: "https://i.pravatar.cc/150?img=1",
        matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        id: "2",
        name: "Sam Lee",
        age: 26,
        lastMessage: "Let's chat later",
        avatarUrl: "https://i.pravatar.cc/150?img=2",
        matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: "3",
        name: "Taylor Kim",
        age: 31,
        lastMessage: "Where should we meet?",
        avatarUrl: "https://i.pravatar.cc/150?img=3",
        matchedAt: new Date().toISOString(),
    },
];
};

const MatchListScreen: React.FC<Props> = ({ navigation }) => {
const [matches, setMatches] = useState<Match[]>([]);
const [query, setQuery] = useState("");
const [loading, setLoading] = useState<boolean>(true);
const [refreshing, setRefreshing] = useState<boolean>(false);

const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
        const data = await mockFetchMatches();
        // sort newest first
        data.sort(
            (a, b) =>
                (new Date(b.matchedAt || 0).getTime() || 0) -
                (new Date(a.matchedAt || 0).getTime() || 0)
        );
        setMatches(data);
    } catch (e) {
        console.warn("Failed to load matches", e);
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    loadMatches();
}, [loadMatches]);

const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
        const data = await mockFetchMatches();
        data.sort(
            (a, b) =>
                (new Date(b.matchedAt || 0).getTime() || 0) -
                (new Date(a.matchedAt || 0).getTime() || 0)
        );
        setMatches(data);
    } catch (e) {
        console.warn("Refresh failed", e);
    } finally {
        setRefreshing(false);
    }
}, []);

const filtered = matches.filter((m) =>
    m.name.toLowerCase().includes(query.trim().toLowerCase())
);

const renderItem = ({ item }: { item: Match }) => {
    return (
        <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("MatchDetail", { matchId: item.id })}
        >
            <Image
                source={{ uri: item.avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.name}>
                        {item.name}
                        {item.age ? `, ${item.age}` : ""}
                    </Text>
                    <Text style={styles.time}>
                        {item.matchedAt ? timeAgo(item.matchedAt) : ""}
                    </Text>
                </View>
                <Text style={styles.message} numberOfLines={1}>
                    {item.lastMessage ?? "Say hi!"}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

return (
    <SafeAreaProvider style={styles.container}>
        {/* <View style={styles.header}>
            <Text style={styles.title}>Matches</Text>
        </View> */}

        <View style={styles.searchContainer}>
            <TextInput
                placeholder="Search matches"
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                clearButtonMode="while-editing"
            />
        </View>

        {loading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        ) : filtered.length === 0 ? (
            <View style={styles.center}>
                <Text style={styles.emptyText}>
                    {query ? "No matches found." : "No matches yet. Start swiping!"}
                </Text>
            </View>
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
    </SafeAreaProvider>
);
};

const timeAgo = (iso?: string) => {
if (!iso) return "";
const diff = Date.now() - new Date(iso).getTime();
const minutes = Math.floor(diff / (1000 * 60));
if (minutes < 1) return "just now";
if (minutes < 60) return `${minutes}m`;
const hours = Math.floor(minutes / 60);
if (hours < 24) return `${hours}h`;
const days = Math.floor(hours / 24);
return `${days}d`;
};

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#fff" },
header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
},
title: { fontSize: 24, fontWeight: "700" },
searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
},
searchInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
},
row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
},
avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ddd",
},
content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
},
topRow: { flexDirection: "row", justifyContent: "space-between" },
name: { fontSize: 16, fontWeight: "600" },
time: { fontSize: 12, color: "#888" },
message: { marginTop: 4, color: "#666" },
center: { flex: 1, alignItems: "center", justifyContent: "center" },
emptyText: { color: "#666" },
});

export default MatchListScreen;