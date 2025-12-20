import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Message = {
    id: string;
    text: string;
    createdAt: number;
    senderId: string;
    senderName?: string;
};

type ChatRouteParams = {
    partnerId: string;
    partnerName?: string;
    partnerAvatarUrl?: string;
    currentUserId?: string;
    currentUserName?: string;
};

export default function ChatsScreen() {
    const route = useRoute<RouteProp<Record<string, ChatRouteParams>, string>>();
    const navigation = useNavigation();
    const params = route.params ?? ({} as ChatRouteParams);

    const currentUserId = params.currentUserId ?? "me";
    const partnerId = params.partnerId ?? "partner";
    const partnerName = params.partnerName ?? "Match";
    const partnerAvatarUrl = params.partnerAvatarUrl ?? undefined;

    const [messages, setMessages] = useState<Message[]>(() => {
        // starter sample conversation
        const now = Date.now();
        return [
            {
                id: "m1",
                text: `Hi ${partnerName}, nice to match with you!`,
                createdAt: now - 1000 * 60 * 60 * 2,
                senderId: partnerId,
                senderName: partnerName,
            },
            {
                id: "m2",
                text: "Hey! Great to meet you — tell me about your favorite weekend activity.",
                createdAt: now - 1000 * 60 * 60,
                senderId: currentUserId,
                senderName: params.currentUserName ?? "You",
            },
        ];
    });

    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const flatRef = useRef<FlatList<Message> | null>(null);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: partnerName,
        });
    }, [navigation, partnerName]);

    useEffect(() => {
        // simulate partner typing occasionally (example)
        const t = setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 1500);
        }, 5000);
        return () => clearTimeout(t);
    }, []);

    const sendMessage = useCallback(() => {
        if (!input.trim()) return;
        const newMsg: Message = {
            id: String(Date.now()),
            text: input.trim(),
            createdAt: Date.now(),
            senderId: currentUserId,
            senderName: params.currentUserName ?? "You",
        };
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        Keyboard.dismiss();

        // auto-scroll handled by onContentSizeChange / FlatList ref
        // In a real app you would also send this to your server / websocket here.
    }, [input, currentUserId, params.currentUserName]);

    const renderItem = ({ item }: { item: Message }) => {
        const isMe = item.senderId === currentUserId;
        return (
            <View style={[styles.messageRow, isMe ? styles.rowRight : styles.rowLeft]}>
                {!isMe && (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.senderName ? item.senderName.charAt(0).toUpperCase() : "M"}
                        </Text>
                    </View>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.messageText, isMe ? styles.textMe : styles.textThem]}>
                        {item.text}
                    </Text>
                    <Text style={styles.timeText}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                </View>
                {isMe && <View style={styles.avatarPlaceholder} />}
            </View>
        );
    };

    return (
        <SafeAreaProvider style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.select({ ios: "padding", android: undefined })}
                keyboardVerticalOffset={Platform.select({ ios: 90, android: 60 })}
            >
                <FlatList
                    ref={flatRef}
                    data={messages}
                    keyExtractor={(m) => m.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => {
                        flatRef.current?.scrollToEnd({ animated: true });
                    }}
                    onLayout={() => {
                        flatRef.current?.scrollToEnd({ animated: true });
                    }}
                />

                {isTyping && (
                    <View style={styles.typingRow}>
                        <Text style={styles.typingText}>{partnerName} is typing…</Text>
                    </View>
                )}

                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        placeholder="Message..."
                        value={input}
                        onChangeText={setInput}
                        multiline
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Text style={styles.sendText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: "#fff" },
    listContent: { padding: 12, paddingBottom: 8 },
    messageRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginVertical: 6,
        maxWidth: "100%",
    },
    rowLeft: { justifyContent: "flex-start" },
    rowRight: { justifyContent: "flex-end" },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#ddd",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    avatarText: { color: "#333", fontWeight: "600" },
    avatarPlaceholder: { width: 44 },
    bubble: {
        maxWidth: "78%",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
    },
    bubbleMe: {
        backgroundColor: "#007AFF",
        borderBottomRightRadius: 4,
        marginLeft: 40,
    },
    bubbleThem: {
        backgroundColor: "#f1f0f0",
        borderBottomLeftRadius: 4,
    },
    messageText: { fontSize: 15 },
    textMe: { color: "#fff" },
    textThem: { color: "#111" },
    timeText: {
        fontSize: 11,
        color: "rgba(0,0,0,0.35)",
        marginTop: 6,
        alignSelf: "flex-end",
    },
    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#e6e6e6",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f7f7f8",
        fontSize: 16,
    },
    sendButton: {
        marginLeft: 8,
        backgroundColor: "#007AFF",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    sendText: { color: "#fff", fontWeight: "600" },
    typingRow: {
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    typingText: {
        fontSize: 13,
        color: "#666",
    },
});