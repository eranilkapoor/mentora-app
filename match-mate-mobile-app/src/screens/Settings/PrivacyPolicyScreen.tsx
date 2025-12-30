import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
} from 'react-native';

export default function PrivacyPolicyScreen({ navigation }: any) {
    const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);

    return (
        <SafeAreaProvider style={styles.safe}>
            <StatusBar barStyle={darkModeEnabled ? 'light-content' : 'dark-content'} />
            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.title}>Privacy Policy — MatchMate</Text>
                    <Text style={styles.updateText}>Last updated: 1st January 2026</Text>

                    <Text style={styles.paragraph}>
                        MatchMate (“we”, “our”, “us”) is committed to protecting your personal information 
                        and your right to privacy. This Privacy Policy explains how we collect, use, 
                        disclose, and safeguard your information when you use the MatchMate Mobile 
                        Application and Website.
                    </Text>

                    <Text style={styles.heading}>1. Information We Collect</Text>
                    <Text style={styles.subHeading}>1.1 Personal Information</Text>
                    <Text style={styles.paragraph}>
                        • Full Name{"\n"}
                        • Gender{"\n"}
                        • Date of Birth{"\n"}
                        • Marital Status{"\n"}
                        • Phone Number{"\n"}
                        • Email Address{"\n"}
                        • City / Country{"\n"}
                        • Profile Photos{"\n"}
                        • Education & Occupation{"\n"}
                        • Partner Preferences
                    </Text>

                    <Text style={styles.subHeading}>1.2 Login & Authentication</Text>
                    <Text style={styles.paragraph}>
                        • Email + Password{"\n"}
                        • Phone Number + OTP{"\n"}
                        • Social Login (Google, Facebook, Apple)
                    </Text>

                    <Text style={styles.subHeading}>1.3 Usage & Device Information</Text>
                    <Text style={styles.paragraph}>
                        • Device type{"\n"}
                        • IP address{"\n"}
                        • App interactions{"\n"}
                        • Crash logs{"\n"}
                        • Cookies (on web)
                    </Text>

                    <Text style={styles.subHeading}>1.4 App Activity</Text>
                    <Text style={styles.paragraph}>
                        • Profile views{"\n"}
                        • Matches, likes, shortlist{"\n"}
                        • Chat messages (encrypted){"\n"}
                        • Verification documents
                    </Text>

                    <Text style={styles.heading}>2. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        We use your information to:{"\n"}
                        • Create/manage your account{"\n"}
                        • Match you with other users{"\n"}
                        • Provide chat features{"\n"}
                        • Improve user experience{"\n"}
                        • Prevent fraud{"\n"}
                        • Provide support{"\n"}
                        • Send important notifications
                    </Text>

                    <Text style={styles.heading}>3. Sharing Your Information</Text>
                    <Text style={styles.paragraph}>
                        We may share information with:{"\n"}
                        • Service providers{"\n"}
                        • Legal authorities{"\n"}
                        • Other users (limited profile info){"\n"}
                    </Text>

                    <Text style={styles.heading}>4. Security</Text>
                    <Text style={styles.paragraph}>
                        We use encryption, secure servers, access control, and regular security audits.
                    </Text>

                    <Text style={styles.heading}>5. Your Rights</Text>
                    <Text style={styles.paragraph}>
                        You may:{"\n"}
                        • Access or edit your info{"\n"}
                        • Delete your account{"\n"}
                        • Update visibility settings{"\n"}
                        • Withdraw consent
                    </Text>

                    <Text style={styles.heading}>11. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        Company: Webnza! Infotech / MatchMate{"\n"}
                        Email: support@webnza.com{"\n"}
                        Website: www.webnza.com{"\n"}
                        Address: New Delhi
                    </Text>

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        paddingVertical: 8,
        padding: 16,
        overflow: 'hidden',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#333",
    },
    updateText: {
        fontSize: 12,
        color: "#777",
        marginBottom: 16,
    },
    heading: {
        fontSize: 20,
        fontWeight: "700",
        marginTop: 20,
        marginBottom: 8,
        color: "#222",
    },
    subHeading: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 12,
        marginBottom: 4,
        color: "#444",
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        color: "#555",
        marginBottom: 8,
    },
});