import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

interface Match {
    id: string;
    name: string;
    age: number;
    location: string;
    bio: string;
    images: string[];
    interests: string[];
    matchPercentage: number;
}

const MatchDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [match, setMatch] = useState<Match | null>(null);

    useEffect(() => {
        const { matchId } = route.params as { matchId: string };
        // Fetch match details by ID
        fetchMatchDetails(matchId);
    }, [route.params]);

    const fetchMatchDetails = async (matchId: string) => {
        // API call to fetch match details
        // setMatch(data);
    };

    if (!match) {
        return <Text style={styles.loading}>Loading...</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: match.images[0] }} style={styles.profileImage} />
            
            <View style={styles.header}>
                <Text style={styles.name}>{match.name}, {match.age}</Text>
                <Text style={styles.location}>{match.location}</Text>
                <Text style={styles.matchScore}>{match.matchPercentage}% Match</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bio</Text>
                <Text style={styles.bio}>{match.bio}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Interests</Text>
                <View style={styles.interestsList}>
                    {match.interests.map((interest) => (
                        <View key={interest} style={styles.interestTag}>
                            <Text style={styles.interestText}>{interest}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.passButton}>
                    <Text style={styles.buttonText}>Pass</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.likeButton}>
                    <Text style={styles.buttonText}>Like</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    profileImage: { width: '100%', height: 400 },
    header: { padding: 16 },
    name: { fontSize: 24, fontWeight: 'bold' },
    location: { fontSize: 14, color: '#666' },
    matchScore: { fontSize: 16, color: '#FF6B6B', fontWeight: '600', marginTop: 8 },
    section: { paddingHorizontal: 16, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    bio: { fontSize: 14, color: '#333', lineHeight: 20 },
    interestsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    interestTag: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    interestText: { fontSize: 12 },
    actionButtons: { flexDirection: 'row', padding: 16, gap: 12 },
    passButton: { flex: 1, backgroundColor: '#ddd', padding: 12, borderRadius: 8, alignItems: 'center' },
    likeButton: { flex: 1, backgroundColor: '#FF6B6B', padding: 12, borderRadius: 8, alignItems: 'center' },
    buttonText: { fontWeight: '600', color: '#fff' },
    loading: { flex: 1, textAlign: 'center', textAlignVertical: 'center' },
});

export default MatchDetailScreen;