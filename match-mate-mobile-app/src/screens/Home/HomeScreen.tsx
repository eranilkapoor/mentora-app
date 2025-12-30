import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeHeader from "../../components/HomeHeader";

const { width } = Dimensions.get("window");

/** ---- MOCK DATA (Jeevansathi Style) ---- */
const PROFILES = [
  {
    id: "1",
    name: "Gayatri",
    age: 39,
    height: "5'4\"",
    location: "Pune, Maharashtra",
    religion: "Hindu • Brahmin",
    education: "MBA",
    profession: "HR Manager",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
    ],
  },
  {
    id: "2",
    name: "Neha",
    age: 35,
    height: "5'6\"",
    location: "Mumbai, Maharashtra",
    religion: "Hindu • Maratha",
    education: "B.Tech",
    profession: "Software Engineer",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    ],
  },
];

/** ---- PHOTO CAROUSEL ---- */
const PhotoCarousel = ({ photos }: { photos: string[] }) => {
  return (
    <FlatList
      data={photos}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item }) => (
        <Image source={{ uri: item }} style={styles.photo} />
      )}
    />
  );
};

/** ---- PROFILE CARD ---- */
const ProfileCard = ({ item, onChat, onView }: any) => {
  return (
    <View style={styles.card}>
      <PhotoCarousel photos={item.photos} />

      <View style={styles.cardContent}>
        <Text style={styles.name}>
          {item.name}, {item.age}
        </Text>

        <Text style={styles.meta}>
          {item.height} • {item.location}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Education</Text>
        <Text style={styles.value}>{item.education}</Text>

        <Text style={styles.label}>Profession</Text>
        <Text style={styles.value}>{item.profession}</Text>

        <Text style={styles.label}>Religion / Community</Text>
        <Text style={styles.value}>{item.religion}</Text>

        {/* ---- ACTION BUTTONS ---- */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.chatBtn} onPress={onChat}>
            <Text style={styles.chatText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewBtn} onPress={onView}>
            <Text style={styles.viewText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shortlistBtn}>
            <Text style={styles.shortlistText}>Shortlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/** ---- HOME SCREEN ---- */
export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaProvider style={styles.container}>
      <HomeHeader />

      <FlatList
        data={PROFILES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProfileCard
            item={item}
            onChat={() => navigation.navigate("ChatScreen", { user: item })}
            onView={() =>
              navigation.navigate("MatchDetail", { user: item })
            }
          />
        )}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 3,
  },

  photo: {
    width,
    height: 320,
    resizeMode: "cover",
  },

  cardContent: {
    padding: 16,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  meta: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },

  label: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },

  actions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },

  chatBtn: {
    flex: 1,
    backgroundColor: "#ff6b6b",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  chatText: {
    color: "#fff",
    fontWeight: "700",
  },

  viewBtn: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  viewText: {
    color: "#111",
    fontWeight: "600",
  },

  shortlistBtn: {
    width: 44,
    backgroundColor: "#fff5e6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  shortlistText: {
    fontSize: 18,
  },
});
