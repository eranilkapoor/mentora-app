import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Animated,
    PanResponder,
    ImageBackground,
} from "react-native";
import HomeHeader from "../../components/HomeHeader";

type Match = {
    id: string;
    name: string;
    age: number;
    distanceKm: number;
    bio?: string;
    avatarUrl?: string;
    isOnline?: boolean;
    photos?: string[];
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
        photos: [
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
        ],
    },
    {
        id: "2",
        name: "Jordan",
        age: 26,
        distanceKm: 5,
        bio: "Designer, plant parent",
        avatarUrl: "https://images.unsplash.com/photo-1545996124-6a4f3f6b6d24?w=600&q=80",
        photos: [
            "https://images.unsplash.com/photo-1545996124-6a4f3f6b6d24?w=600&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
        ],
    },
    {
        id: "3",
        name: "Taylor",
        age: 30,
        distanceKm: 8,
        bio: "Traveler & foodie",
        avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
        isOnline: true,
        photos: [
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
            "https://images.unsplash.com/photo-1502233917128-1aa500764cbd?w=600&q=80",
        ],
    },
    {
        id: "4",
        name: "Casey",
        age: 24,
        distanceKm: 12,
        bio: "Runner • Software dev",
        avatarUrl: "https://images.unsplash.com/photo-1531123414780-f2b1f6a3bb6b?w=600&q=80",
        photos: [
            "https://images.unsplash.com/photo-1531123414780-f2b1f6a3bb6b?w=600&q=80",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
        ],
    },
];

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = height * 0.65;

export default function HomeScreen(): React.ReactElement {
    const navigation = useNavigation();
    const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const pan = new Animated.ValueXY();

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }]),
        onPanResponderRelease: (e, { dx }) => {
            const threshold = 100;
            if (dx > threshold) {
                handleLike();
            } else if (dx < -threshold) {
                handleSkip();
            } else {
                Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
            }
        },
    });

    const handleSkip = () => {
        pan.x.setValue(0);
        pan.y.setValue(0);
        setCurrentIndex((prev) => prev + 1);
        setCurrentPhotoIndex(0);
    };

    const handleLike = () => {
        pan.x.setValue(0);
        pan.y.setValue(0);
        setCurrentIndex((prev) => prev + 1);
        setCurrentPhotoIndex(0);
    };

    const handleSuperLike = () => {
        alert("Super Like sent!");
        handleLike();
    };

    const handleChat = () => {
        const current = matches[currentIndex];
        // @ts-ignore
        navigation.navigate("Chat", { matchId: current.id, name: current.name });
    };

    if (currentIndex >= matches.length) {
        return (
            <SafeAreaProvider style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No more matches</Text>
                    <Text style={styles.emptyText}>Come back later for more!</Text>
                    <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={() => setCurrentIndex(0)}
                    >
                        <Text style={styles.reloadText}>Reload</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaProvider>
        );
    }

    const current = matches[currentIndex];
    const currentPhoto = current.photos?.[currentPhotoIndex] || current.avatarUrl;
    const totalPhotos = current.photos?.length || 1;

    return (
        <SafeAreaProvider style={styles.container}>
            <HomeHeader />

            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => {/* Filter logic */}}>
                    <Image
                        source={{
                            uri: "https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=200&q=80",
                        }}
                        style={styles.navIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.topNavTitle}>Discover</Text>
                <TouchableOpacity onPress={() => {/* Notifications */}}>
                    <Image
                        source={{
                            uri: "https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=200&q=80",
                        }}
                        style={styles.navIcon}
                    />
                </TouchableOpacity>
            </View>

            {!showDetails ? (
                <>
                    <View style={styles.cardContainer}>
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                                    opacity: pan.x.interpolate({
                                        inputRange: [-200, 0, 200],
                                        outputRange: [0.5, 1, 0.5],
                                    }),
                                },
                            ]}
                            {...panResponder.panHandlers}
                        >
                            <ImageBackground
                                source={{ uri: currentPhoto }}
                                style={styles.cardImage}
                                imageStyle={{ borderRadius: 20 }}
                            >
                                <View style={styles.photoIndicators}>
                                    {Array.from({ length: totalPhotos }).map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.photoIndicator,
                                                i === currentPhotoIndex && styles.photoIndicatorActive,
                                            ]}
                                        />
                                    ))}
                                </View>

                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardName}>
                                        {current.name}, <Text style={styles.cardAge}>{current.age}</Text>
                                    </Text>
                                    <Text style={styles.cardBio}>{current.bio}</Text>
                                    <View style={styles.cardMeta}>
                                        <Text style={styles.cardDistance}>📍 {current.distanceKm} km away</Text>
                                        {current.isOnline && <Text style={styles.cardOnline}>🟢 Online</Text>}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.detailsTap}
                                    onPress={() => setShowDetails(true)}
                                />
                            </ImageBackground>
                        </Animated.View>
                    </View>

                    <View style={styles.photoNav}>
                        <TouchableOpacity
                            onPress={() =>
                                setCurrentPhotoIndex((prev) => Math.max(prev - 1, 0))
                            }
                            style={styles.photoNavButton}
                        >
                            <Text style={styles.photoNavText}>‹</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                setCurrentPhotoIndex((prev) =>
                                    Math.min(prev + 1, totalPhotos - 1)
                                )
                            }
                            style={styles.photoNavButton}
                        >
                            <Text style={styles.photoNavText}>›</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomNav}>
                        <TouchableOpacity style={styles.navButton} onPress={handleSkip}>
                            <Text style={styles.skipIcon}>✕</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} onPress={handleSuperLike}>
                            <Text style={styles.superLikeIcon}>⭐</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} onPress={handleLike}>
                            <Text style={styles.likeIcon}>❤️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} onPress={handleChat}>
                            <Text style={styles.chatIcon}>💬</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.detailsContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            setShowDetails(false);
                            setCurrentPhotoIndex(0);
                        }}
                    >
                        <Text style={styles.backButtonText}>‹ Back</Text>
                    </TouchableOpacity>

                    <Image
                        source={{ uri: currentPhoto }}
                        style={styles.detailsImage}
                    />

                    <View style={styles.detailsContent}>
                        <Text style={styles.detailsName}>
                            {current.name}, {current.age}
                        </Text>
                        <Text style={styles.detailsBio}>{current.bio}</Text>
                        <Text style={styles.detailsDistance}>📍 {current.distanceKm} km away</Text>

                        <View style={styles.photoIndicators}>
                            {Array.from({ length: totalPhotos }).map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.photoIndicator,
                                        i === currentPhotoIndex && styles.photoIndicatorActive,
                                    ]}
                                />
                            ))}
                        </View>

                        <View style={styles.detailsActions}>
                            <TouchableOpacity
                                style={[styles.detailsButton, styles.skipButtonDetails]}
                                onPress={() => {
                                    setShowDetails(false);
                                    handleSkip();
                                }}
                            >
                                <Text style={styles.detailsButtonText}>Skip</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.detailsButton, styles.likeButtonDetails]}
                                onPress={() => {
                                    setShowDetails(false);
                                    handleLike();
                                }}
                            >
                                <Text style={styles.detailsButtonTextLike}>Like</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    topNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    topNavTitle: { fontSize: 24, fontWeight: "700", color: "#000" },
    navIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#ddd" },
    cardContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 20,
        overflow: "hidden",
    },
    cardImage: {
        width: "100%",
        height: "100%",
        justifyContent: "space-between",
        paddingBottom: 16,
    },
    photoIndicators: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingTop: 12,
        gap: 4,
    },
    photoIndicator: {
        flex: 1,
        height: 3,
        backgroundColor: "rgba(255,255,255,0.4)",
        borderRadius: 1.5,
    },
    photoIndicatorActive: { backgroundColor: "#fff" },
    cardInfo: {
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    cardName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
    },
    cardAge: { fontWeight: "600" },
    cardBio: {
        fontSize: 14,
        color: "#fff",
        marginTop: 4,
    },
    cardMeta: {
        marginTop: 8,
        gap: 8,
    },
    cardDistance: { fontSize: 13, color: "#fff" },
    cardOnline: { fontSize: 13, color: "#32d74b" },
    detailsTap: { position: "absolute", width: "100%", height: "100%" },
    photoNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginVertical: 12,
        gap: 12,
    },
    photoNavButton: {
        flex: 1,
        padding: 12,
        backgroundColor: "#f2f2f6",
        borderRadius: 10,
        alignItems: "center",
    },
    photoNavText: { fontSize: 20, color: "#111" },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 16,
    },
    navButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },
    skipIcon: { fontSize: 24 },
    superLikeIcon: { fontSize: 24 },
    likeIcon: { fontSize: 24 },
    chatIcon: { fontSize: 24 },
    detailsContainer: { flex: 1 },
    backButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButtonText: { fontSize: 16, color: "#ff6b6b", fontWeight: "600" },
    detailsImage: {
        width: "100%",
        height: 300,
        resizeMode: "cover",
    },
    detailsContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    detailsName: { fontSize: 20, fontWeight: "700", color: "#111" },
    detailsBio: { fontSize: 14, color: "#666", marginTop: 8 },
    detailsDistance: { fontSize: 13, color: "#777", marginTop: 4 },
    detailsActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: "auto",
        paddingBottom: 24,
    },
    detailsButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    skipButtonDetails: { backgroundColor: "#f2f2f6" },
    likeButtonDetails: { backgroundColor: "#ff6b6b" },
    detailsButtonText: { fontSize: 16, fontWeight: "600", color: "#111" },
    detailsButtonTextLike: { fontSize: 16, fontWeight: "600", color: "#fff" },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyTitle: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 8 },
    emptyText: { fontSize: 14, color: "#666", marginBottom: 20 },
    reloadButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "#ff6b6b",
        borderRadius: 10,
    },
    reloadText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});