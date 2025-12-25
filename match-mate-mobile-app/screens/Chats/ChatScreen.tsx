import React, { useState, useEffect } from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFocusEffect } from "@react-navigation/native";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';

type Message = {
    id: string;
    senderId: string;
    text?: string;
    imageUrl?: string;
    timestamp: number;
    type: 'text' | 'image';
};

export default function ChatScreen({ navigation, route }: any) {
    const { partnerId, partnerName } = route.params || {};
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: "#007AFF", fontSize: 16 }}>← Back</Text>
                </TouchableOpacity>
            ),
            title: partnerName,
        });
    }, [navigation, partnerName]);

    useFocusEffect(
        React.useCallback(() => {
            fetchMessages(partnerId);
        }, [partnerId])
    );

    const fetchMessages = (pId: string) => {
        setMessages([
            { id: "1", senderId: "me", text: "Hey!", timestamp: Date.now() - 5000, type: 'text' },
            { id: "2", senderId: pId, text: "Hi there!", timestamp: Date.now() - 3000, type: 'text' },
        ]);
    };

    const handleSendMessage = () => {
        if (inputText.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                senderId: "me",
                text: inputText,
                timestamp: Date.now(),
                type: 'text',
            };
            setMessages([newMessage, ...messages]);
            setInputText("");
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newMessage: Message = {
                id: Date.now().toString(),
                senderId: "me",
                imageUrl: result.assets[0].uri,
                timestamp: Date.now(),
                type: 'image',
            };
            setMessages([newMessage, ...messages]);
        }
    };

    const emojis = ['😀', '😂', '❤️', '👍', '🎉', '😢', '😍', '🔥'];

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[styles.messageRow, item.senderId === "me" ? styles.sentRow : styles.receivedRow]}>
            <View style={[styles.messageBubble, item.senderId === "me" ? styles.sentMessage : styles.receivedMessage]}>
                {item.type === 'text' ? (
                    <Text style={[styles.messageText, item.senderId === "me" ? styles.sentText : styles.receivedText]}>
                        {item.text}
                    </Text>
                ) : (
                    <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
                )}
            </View>
            <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    return (
        <SafeAreaProvider style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    inverted
                    contentContainerStyle={styles.listContent}
                />

                {showEmojiPicker && (
                    <View style={styles.emojiPicker}>
                        {emojis.map((emoji) => (
                            <TouchableOpacity key={emoji} onPress={() => {
                                setInputText(inputText + emoji);
                                setShowEmojiPicker(false);
                            }}>
                                <Text style={styles.emoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <Text style={styles.iconButton}>😊</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage}>
                        <Text style={styles.iconButton}>📷</Text>
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.textInput, { maxHeight: 100 }]}
                        placeholder="Type a message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    flex: { flex: 1 },
    listContent: { paddingVertical: 10 },
    messageRow: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12, alignItems: 'flex-end' },
    sentRow: { justifyContent: 'flex-end' },
    receivedRow: { justifyContent: 'flex-start' },
    messageBubble: { maxWidth: '75%', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
    sentMessage: { backgroundColor: "#007AFF" },
    receivedMessage: { backgroundColor: "#f0f0f0" },
    messageText: { fontSize: 14 },
    sentText: { color: "#fff" },
    receivedText: { color: "#000" },
    messageImage: { width: 200, height: 200, borderRadius: 12 },
    timestamp: { fontSize: 11, color: '#999', marginHorizontal: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f9f9f9', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
    textInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 8, backgroundColor: '#fff' },
    iconButton: { fontSize: 24, marginHorizontal: 4 },
    sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
    sendButtonText: { color: '#fff', fontWeight: '600' },
    emojiPicker: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, backgroundColor: '#f0f0f0' },
    emoji: { fontSize: 28, padding: 8, width: '25%', textAlign: 'center' },
});
