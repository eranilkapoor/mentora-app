import React, { useState } from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Chat = {
    id: string;
    partnerId: string;
    partnerName: string;
    partnerAvatarUrl?: string;
    lastMessage: string;
    lastMessageTime: number;
};

export default function ChatsListScreen({ navigation }: any) {
    const [chats] = useState<Chat[]>([
        {
            id: "c1",
            partnerId: "user1",
            partnerName: "Sarah",
            lastMessage: "That sounds great!",
            lastMessageTime: Date.now() - 1000 * 60 * 5,
        },
        {
            id: "c2",
            partnerId: "user2",
            partnerName: "Emma",
            lastMessage: "See you soon 😊",
            lastMessageTime: Date.now() - 1000 * 60 * 30,
        },
    ]);

    const handleChatPress = (chat: Chat) => {
        navigation.navigate("Chat", {
            partnerId: chat.partnerId,
            partnerName: chat.partnerName,
            partnerAvatarUrl: chat.partnerAvatarUrl,
            currentUserId: "me",
            currentUserName: "You",
        });
    };

    const renderChatItem = ({ item }: { item: Chat }) => {
        const timeString = new Date(item.lastMessageTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => handleChatPress(item)}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.partnerName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.partnerName}>{item.partnerName}</Text>
                        <Text style={styles.timeText}>{timeString}</Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaProvider style={styles.container}>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={renderChatItem}
            />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 20 },
    chatContent: { flex: 1 },
    chatHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    partnerName: { fontSize: 16, fontWeight: "600", color: "#000" },
    timeText: { fontSize: 13, color: "#999" },
    lastMessage: { fontSize: 14, color: "#666" },
});
