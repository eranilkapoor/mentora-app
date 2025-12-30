import React, { useState, useEffect, useCallback } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

type Message = {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
  type: "text" | "image";
};

export default function ChatScreen({ navigation, route }: any) {
  const { partnerId, partnerName, partnerPhoto } = route.params || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMessages(partnerId);
    }, [partnerId])
  );

  const fetchMessages = (pId: string) => {
    setMessages([
      {
        id: "1",
        senderId: "me",
        text: "Hi, nice to connect 😊",
        timestamp: Date.now() - 60000,
        type: "text",
      },
      {
        id: "2",
        senderId: pId,
        text: "Hello! Same here.",
        timestamp: Date.now() - 30000,
        type: "text",
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: inputText,
      timestamp: Date.now(),
      type: "text",
    };

    setMessages((prev) => [newMessage, ...prev]);
    setInputText("");
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: "me",
        imageUrl: result.assets[0].uri,
        timestamp: Date.now(),
        type: "image",
      };
      setMessages((prev) => [newMessage, ...prev]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === "me";

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.rightAlign : styles.leftAlign,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.otherBubble,
          ]}
        >
          {item.type === "text" ? (
            <Text style={[styles.messageText, isMe && styles.myText]}>
              {item.text}
            </Text>
          ) : (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          )}
          <Text style={styles.time}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Image
          source={{
            uri:
              partnerPhoto ||
              "https://i.pravatar.cc/150?img=12",
          }}
          style={styles.headerAvatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{partnerName}</Text>
          <Text style={styles.headerSub}>Online</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ProfileDetails", { userId: partnerId })
          }
        >
          <Text style={styles.viewProfile}>View</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 12 }}
        />

        {showEmojiPicker && (
          <View style={styles.emojiBox}>
            {["😀", "😂", "❤️", "👍", "😍", "🙏"].map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => {
                  setInputText(inputText + e);
                  setShowEmojiPicker(false);
                }}
              >
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 🔹 Input */}
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Text style={styles.icon}>😊</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.icon}>📷</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity onPress={handleSendMessage}>
            <Text style={styles.send}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  back: { fontSize: 28, marginRight: 8 },

  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  headerName: { fontSize: 16, fontWeight: "600" },
  headerSub: { fontSize: 12, color: "#4caf50" },

  viewProfile: {
    color: "#e53935",
    fontWeight: "600",
  },

  messageRow: { marginVertical: 4, paddingHorizontal: 12 },
  leftAlign: { alignItems: "flex-start" },
  rightAlign: { alignItems: "flex-end" },

  bubble: {
    maxWidth: "75%",
    borderRadius: 14,
    padding: 10,
  },

  myBubble: {
    backgroundColor: "#fdecea",
  },

  otherBubble: {
    backgroundColor: "#f1f3f6",
  },

  messageText: { fontSize: 14, color: "#222" },
  myText: { color: "#b71c1c" },

  time: {
    fontSize: 10,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 4,
  },

  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 6,
    backgroundColor: "#fff",
  },

  icon: { fontSize: 22, marginHorizontal: 4 },

  send: {
    color: "#e53935",
    fontWeight: "600",
    paddingHorizontal: 8,
  },

  emojiBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    backgroundColor: "#f7f7f7",
  },

  emoji: { fontSize: 26, margin: 8 },
});
