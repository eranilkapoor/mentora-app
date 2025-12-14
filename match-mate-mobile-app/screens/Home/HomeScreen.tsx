import React, { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
View,
Text,
StyleSheet,
TextInput,
TouchableOpacity,
FlatList,
Image,
RefreshControl,
GestureResponderEvent,
} from "react-native";

type Match = {
id: string;
name: string;
age: number;
distanceKm: number;
bio?: string;
avatarUrl?: string;
isOnline?: boolean;
};

const MOCK_MATCHES: Match[] = [
{
    id: "1",
    name: "Alex",
    age: 28,
    distanceKm: 2,
    bio: "Coffee addict • Outdoor lover",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
    isOnline: true,
},
{
    id: "2",
    name: "Jordan",
    age: 26,
    distanceKm: 5,
    bio: "Designer, plant parent",
    avatarUrl: "https://images.unsplash.com/photo-1545996124-6a4f3f6b6d24?w=600&q=80",
},
{
    id: "3",
    name: "Taylor",
    age: 30,
    distanceKm: 8,
    bio: "Traveler & foodie",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    isOnline: true,
},
{
    id: "4",
    name: "Casey",
    age: 24,
    distanceKm: 12,
    bio: "Runner • Software dev",
    avatarUrl: "https://images.unsplash.com/photo-1531123414780-f2b1f6a3bb6b?w=600&q=80",
},
];

export default function HomeScreen(): React.ReactElement {
const navigation = useNavigation();
const [query, setQuery] = useState("");
const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate network request
    setTimeout(() => {
        // In a real app you would fetch new data here
        setMatches((prev) => [...prev]);
        setRefreshing(false);
    }, 800);
}, []);

const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter(
        (m) => m.name.toLowerCase().includes(q) || (m.bio || "").toLowerCase().includes(q)
    );
}, [query, matches]);

const handleOpenProfile = (id: string) => {
    // Navigate to Profile screen (assumes route exists in navigator)
    // @ts-ignore - using any navigation typing for example brevity
    navigation.navigate("Profile", { id });
};

const handleLike = (e: GestureResponderEvent, id: string) => {
    e.stopPropagation();
    // Placeholder like behaviour - toggle removal to simulate like action
    setMatches((prev) => prev.filter((m) => m.id !== id));
};

const renderMatch = ({ item }: { item: Match }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={() => handleOpenProfile(item.id)}>
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            <View style={styles.cardContent}>
                <View style={styles.rowSpace}>
                    <Text style={styles.name}>
                        {item.name}, <Text style={styles.age}>{item.age}</Text>
                    </Text>
                    <Text style={styles.distance}>{item.distanceKm} km</Text>
                </View>
                <Text style={styles.bio} numberOfLines={2}>
                    {item.bio}
                </Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.messageButton]}
                        onPress={(e) => {
                            e.stopPropagation();
                            // @ts-ignore
                            navigation.navigate("Chat", { matchId: item.id, name: item.name });
                        }}
                    >
                        <Text style={styles.actionText}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.likeButton]}
                        onPress={(e) => handleLike(e, item.id)}
                    >
                        <Text style={[styles.actionText, styles.likeText]}>Like</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {item.isOnline && <View style={styles.onlineDot} />}
        </TouchableOpacity>
    );
};

return (
    <SafeAreaProvider style={styles.container}>
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Good morning</Text>
                <Text style={styles.title}>Find your mate</Text>
            </View>
            <TouchableOpacity
                onPress={() => {
                    // @ts-ignore
                    navigation.navigate("ProfileSettings");
                }}
            >
                <Image
                    source={{
                        uri: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&q=80",
                    }}
                    style={styles.profileIcon}
                />
            </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
            <TextInput
                placeholder="Search name, bio or location"
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
                clearButtonMode="while-editing"
            />
            {query ? (
                <TouchableOpacity onPress={() => setQuery("")} style={styles.clearButton}>
                    <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
            ) : null}
        </View>

        <Text style={styles.sectionTitle}>Suggested</Text>

        <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderMatch}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No matches found</Text>
                </View>
            }
        />
    </SafeAreaProvider>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#fff" },
header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
},
greeting: { fontSize: 14, color: "#666" },
title: { fontSize: 22, fontWeight: "700", color: "#111" },
profileIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#ddd" },
searchContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    position: "relative",
},
searchInput: {
    backgroundColor: "#f2f2f6",
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
},
clearButton: {
    position: "absolute",
    right: 12,
    top: 8,
    height: 28,
    width: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
},
clearText: { fontSize: 16, color: "#888" },
sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
},
list: { paddingHorizontal: 16, paddingBottom: 24 },
card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    alignItems: "center",
},
avatar: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#eee" },
cardContent: { flex: 1, marginLeft: 12 },
rowSpace: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
name: { fontSize: 16, fontWeight: "700", color: "#111" },
age: { fontWeight: "600", color: "#555" },
distance: { fontSize: 13, color: "#777" },
bio: { marginTop: 4, color: "#666", fontSize: 13 },
actions: { marginTop: 10, flexDirection: "row" },
actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
},
messageButton: { backgroundColor: "#f2f2f6" },
likeButton: { backgroundColor: "#ffeef0" },
actionText: { fontSize: 14, color: "#111" },
likeText: { color: "#d9534f", fontWeight: "700" },
onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#32d74b",
    position: "absolute",
    right: 18,
    top: 18,
    borderWidth: 2,
    borderColor: "#fff",
},
empty: { padding: 24, alignItems: "center" },
emptyText: { color: "#888" },
});