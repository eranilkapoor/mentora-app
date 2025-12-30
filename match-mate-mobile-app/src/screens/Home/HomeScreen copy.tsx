import React, { useState } from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
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
    ScrollView,
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
        avatarUrl: "https://ix-marketing.imgix.net/case-study_3.png?auto=format,compress&w=1446",
        photos: [
            "https://ix-marketing.imgix.net/case-study_3.png?auto=format,compress&w=1446",
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
            "https://ix-marketing.imgix.net/case-study_3.png?auto=format,compress&w=1446",
        ],
    },
    {
        id: "4",
        name: "Casey",
        age: 24,
        distanceKm: 12,
        bio: "Runner • Software dev",
        avatarUrl: "https://ix-marketing.imgix.net/focalpoint.png?auto=format,compress&w=1446",
        photos: [
            "https://ix-marketing.imgix.net/focalpoint.png?auto=format,compress&w=1446",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
        ],
    },
];

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = height * 0.65;

export default function HomeScreen(): React.ReactElement {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const pan = new Animated.ValueXY();

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
        ),
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dx > 120) {
                handleLike();
            } else if (gesture.dx < -120) {
                handleSkip();
            } else {
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        nextCard();
    };

    const handleSuperLike = () => {
        alert("Super Like sent!");
        handleLike();
    };

    const rotate = pan.x.interpolate({
        inputRange: [-200, 0, 200],
        outputRange: ['-10deg', '0deg', '10deg'],
    });

    const likeOpacity = pan.x.interpolate({
        inputRange: [50, 120],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const nopeOpacity = pan.x.interpolate({
        inputRange: [-120, -50],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const nextCard = () => {
        pan.x.setValue(0);
        pan.y.setValue(0);
        setCurrentIndex((prev) => prev + 1);
        setCurrentPhotoIndex(0);
    };

    if (currentIndex >= MOCK_MATCHES.length) {
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

    const current = MOCK_MATCHES[currentIndex];
    const totalPhotos = current.photos?.length || 1;

    return (
        <SafeAreaProvider style={styles.container}>
            <HomeHeader />

            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => {/* Filter logic */ }}>
                    <Image
                        source={{
                            uri: "https://ix-marketing.imgix.net/focalpoint.png?auto=format,compress&w=1446",
                        }}
                        style={styles.navIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.topNavTitle}>Discover</Text>
                <TouchableOpacity onPress={() => {/* Notifications */ }}>
                    <Image
                        source={{
                            uri: "https://ix-marketing.imgix.net/case-study_2.png?auto=format,compress&w=1446",
                        }}
                        style={styles.navIcon}
                    />
                </TouchableOpacity>
            </View>

            {!showDetails ? (
                <>
                    <View style={styles.cardContainer}>
                        {MOCK_MATCHES
                            .slice(currentIndex, currentIndex + 2)
                            .reverse()
                            .map((item, index) => {
                                const isTop = index === 1;
                                return (
                                    <Animated.View
                                        key={item.id}
                                        style={[
                                            styles.card,
                                            !isTop && styles.cardBehind,
                                            isTop && {
                                                transform: [
                                                    { translateX: pan.x },
                                                    { translateY: pan.y },
                                                    { rotate },
                                                ],
                                            },
                                        ]}
                                        {...(isTop ? panResponder.panHandlers : {})}
                                    >
                                        <ImageBackground
                                            source={{ uri: item.photos?.[currentPhotoIndex] || item.avatarUrl }}
                                            style={styles.cardImage}
                                            imageStyle={{ borderRadius: 24 }}
                                        >
                                            {isTop && (
                                                <>
                                                    <Animated.Text style={[styles.likeLabel, { opacity: likeOpacity }]}>
                                                        LIKE
                                                    </Animated.Text>
                                                    <Animated.Text style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
                                                        NOPE
                                                    </Animated.Text>
                                                </>
                                            )}

                                            <View style={styles.cardInfo}>
                                                <Text style={styles.cardName}>
                                                    {item.name}, {item.age}
                                                </Text>
                                                <Text style={styles.cardBio}>{item.bio}</Text>
                                                <Text style={styles.cardDistance}>📍 {item.distanceKm} km away</Text>
                                            </View>
                                        </ImageBackground>
                                    </Animated.View>
                                );
                            })}
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
                            onPress={() => setShowDetails(true)}
                            style={styles.profileButton}
                        >
                            <Text style={styles.profileButtonText}>View Profile</Text>
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
                        <TouchableOpacity style={[styles.actionBtn, styles.skipBtn]} onPress={handleSkip}>
                            <Text style={styles.actionIcon}>✕</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, styles.superLikeBtn]} onPress={handleSuperLike}>
                            <Text style={styles.actionIcon}>⭐</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={handleLike}>
                            <Text style={styles.actionIcon}>❤️</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <ScrollView style={styles.detailsContainer}>
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
                        source={{ uri: current.photos?.[currentPhotoIndex] || current.avatarUrl }}
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

                        <View style={styles.profileActionButtons}>
                            <TouchableOpacity style={styles.profileActionBtn}>
                                <Text style={styles.profileActionText}>💬 Chat</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.profileActionBtn}>
                                <Text style={styles.profileActionText}>🔗 Share</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.profileActionBtn}>
                                <Text style={styles.profileActionText}>🚫 Block</Text>
                            </TouchableOpacity>
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
                </ScrollView>
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
    cardBio: {
        fontSize: 14,
        color: "#fff",
        marginTop: 4,
    },
    cardDistance: { fontSize: 13, color: "#fff" },
    photoNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginVertical: 12,
        gap: 12,
    },
    photoNavButton: {
        flex: 0.2,
        padding: 12,
        backgroundColor: "#f2f2f6",
        borderRadius: 10,
        alignItems: "center",
    },
    photoNavText: { fontSize: 20, color: "#111" },
    profileButton: {
        flex: 0.6,
        padding: 12,
        backgroundColor: "#ff6b6b",
        borderRadius: 10,
        alignItems: "center",
    },
    profileButtonText: { fontSize: 14, fontWeight: "600", color: "#fff" },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 16,
    },
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
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 24,
    },
    detailsName: { fontSize: 20, fontWeight: "700", color: "#111" },
    detailsBio: { fontSize: 14, color: "#666", marginTop: 8 },
    detailsDistance: { fontSize: 13, color: "#777", marginTop: 4 },
    profileActionButtons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
        marginBottom: 20,
    },
    profileActionBtn: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: "#f2f2f6",
        borderRadius: 10,
        alignItems: "center",
    },
    profileActionText: { fontSize: 14, fontWeight: "600", color: "#111" },
    detailsActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 10,
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
    cardBehind: {
        position: 'absolute',
        top: 8,
        transform: [{ scale: 0.95 }],
        opacity: 0.9,
    },
    likeLabel: {
        position: 'absolute',
        top: 40,
        left: 24,
        borderWidth: 3,
        borderColor: '#4cd964',
        color: '#4cd964',
        fontSize: 32,
        fontWeight: '800',
        padding: 8,
        borderRadius: 8,
    },
    nopeLabel: {
        position: 'absolute',
        top: 40,
        right: 24,
        borderWidth: 3,
        borderColor: '#ff3b30',
        color: '#ff3b30',
        fontSize: 32,
        fontWeight: '800',
        padding: 8,
        borderRadius: 8,
    },
    actionBtn: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 6,
    },
    skipBtn: {
        borderWidth: 2,
        borderColor: '#ff3b30',
    },
    likeBtn: {
        borderWidth: 2,
        borderColor: '#4cd964',
    },
    superLikeBtn: {
        borderWidth: 2,
        borderColor: '#0a84ff',
    },
    actionIcon: {
        fontSize: 26,
    },
});
