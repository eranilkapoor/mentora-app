import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
    UIManager,
    LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    question: "How do I create or update my profile?",
    answer:
      "You can edit your profile by going to the Profile section → Edit Profile. Make sure to add clear photos and complete details for better matches.",
  },
  {
    question: "How does MatchMate find matches?",
    answer:
      "Our algorithm recommends matches based on your preferences such as age, location, education, interests, and other profile parameters.",
  },
  {
    question: "Is my information safe?",
    answer:
      "Yes. We use secure servers, encrypted data transfer, and strict privacy policies to protect your personal information.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "You can request account deletion from Settings → Account → Delete Account. Once deleted, your data will be removed within standard retention timelines.",
  },
];

export default function HelpSupportScreen({ navigation }: any) {
    const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(expanded === index ? null : index);
    };


    return (
        <SafeAreaProvider style={styles.safe}>
            <StatusBar barStyle={darkModeEnabled ? 'light-content' : 'dark-content'} />
            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.subtitle}>
                        We're here to help! Contact us or browse FAQs below.
                    </Text>

                    {/* Contact Blocks */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Contact Support</Text>

                        <TouchableOpacity style={styles.row}>
                            <Ionicons name="mail-outline" size={22} color="#444" />
                            <Text style={styles.rowText}>support@webnza.com</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.row}>
                            <Ionicons name="call-outline" size={22} color="#444" />
                            <Text style={styles.rowText}>+91 9654698878</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.row}>
                            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                            <Text style={styles.rowText}>Chat with us on WhatsApp</Text>
                        </TouchableOpacity>

                    </View>

                    {/* FAQ Section */}
                    <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

                    {faqs.map((faq, index) => (
                        <View key={index} style={styles.faqContainer}>
                        <TouchableOpacity
                            onPress={() => toggleFAQ(index)}
                            style={styles.faqHeader}
                        >
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <Ionicons
                            name={expanded === index ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#444"
                            />
                        </TouchableOpacity>

                        {expanded === index && (
                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        )}
                        </View>
                    ))}

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
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#F7F7F7",
        padding: 16,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
        color: "#222",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    rowText: {
        marginLeft: 10,
        fontSize: 15,
        color: "#444",
    },

    faqTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 10,
        color: "#222",
    },
    faqContainer: {
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        paddingVertical: 12,
    },
    faqHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    faqQuestion: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    faqAnswer: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
        color: "#555",
    },
});