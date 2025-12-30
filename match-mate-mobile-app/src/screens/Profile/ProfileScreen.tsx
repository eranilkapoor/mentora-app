import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const profile = {
    photos: [
        "https://ix-marketing.imgix.net/focalpoint.png?auto=format,compress&w=1446",
        "https://ix-marketing.imgix.net/case-study_2.png?auto=format,compress&w=1446",
        "https://ix-marketing.imgix.net/case-study_3.png?auto=format,compress&w=1446",
    ],
    basic: {
        name: "Amit Sharma",
        age: 29,
        height: "5 ft 9 in",
        maritalStatus: "Never Married",
    },
    religion: {
        religion: "Hindu",
        caste: "Brahmin",
        motherTongue: "Hindi",
    },
    education: {
        education: "B.Tech",
        college: "IIT Delhi",
        profession: "Software Engineer",
        income: "₹15 LPA",
    },
    location: {
        country: "India",
        state: "Maharashtra",
        city: "Pune",
    },
    physical: {
        weight: "70 kg",
        bodyType: "Athletic",
        complexion: "Fair",
    },
    lifestyle: {
        smoking: "No",
        drinking: "Occasionally",
        diet: "Vegetarian",
    },
    family: {
        fatherStatus: "Retired",
        motherStatus: "Homemaker",
        siblings: "1 Brother, 1 Sister",
        familyType: "Joint Family",
        familyValues: "Traditional",
    },
    about:
        "I am a calm and positive person who believes in mutual respect and family values. Looking for a compatible life partner.",
    partnerPreferences: {
        ageRange: "24 - 27 years",
        heightRange: "5 ft 2 in - 5 ft 6 in",
        religion: "Hindu, Sikh",
        caste: "Open",
        education: "B.Tech, MBA, M.Tech",
        profession: "Software Engineer, Doctor, MBA",
        maritalStatus: "Never Married",
        location: "India",
        bodyType: "Slim, Athletic",
        complexion: "Fair, Wheatish",
        diet: "Vegetarian",
        smoking: "No",
        drinking: "No",
        familyType: "Joint, Nuclear",
    },
    interests: {
        hobbies: "Reading, Traveling, Cooking, Yoga",
        music: "Classical, Bollywood",
        movies: "Drama, Romance",
        sports: "Cricket, Badminton",
    },
};

const Section = ({ title, children }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.card}>{children}</View>
    </View>
);

const Row = ({ label, value }: any) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "-"}</Text>
    </View>
);

export default function ProfileScreen() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Photo Carousel */}
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.carousel}
            >
                {profile.photos.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.photo} />
                ))}
            </ScrollView>

            {/* Basic Details */}
            <View style={styles.header}>
                <Text style={styles.name}>{profile.basic.name}</Text>
                <Text style={styles.subText}>
                    {profile.basic.age} yrs • {profile.basic.height}
                </Text>
                <Text style={styles.subText}>
                    {profile.basic.maritalStatus}
                </Text>
            </View>

            {/* About */}
            <Section title="About Me">
                <Text style={styles.aboutText}>{profile.about}</Text>
            </Section>

            {/* Religious & Social */}
            <Section title="Religious & Social Background">
                <Row label="Religion" value={profile.religion.religion} />
                <Row label="Caste" value={profile.religion.caste} />
                <Row label="Mother Tongue" value={profile.religion.motherTongue} />
            </Section>

            {/* Education & Career */}
            <Section title="Education & Career">
                <Row label="Education" value={profile.education.education} />
                <Row label="College" value={profile.education.college} />
                <Row label="Profession" value={profile.education.profession} />
                <Row label="Annual Income" value={profile.education.income} />
            </Section>

            {/* Location */}
            <Section title="Location Details">
                <Row label="Country" value={profile.location.country} />
                <Row label="State" value={profile.location.state} />
                <Row label="City" value={profile.location.city} />
            </Section>

            {/* Physical Attributes */}
            <Section title="Physical Attributes">
                <Row label="Height" value={profile.basic.height} />
                <Row label="Weight" value={profile.physical.weight} />
                <Row label="Body Type" value={profile.physical.bodyType} />
                <Row label="Complexion" value={profile.physical.complexion} />
            </Section>

            {/* Lifestyle */}
            <Section title="Lifestyle">
                <Row label="Smoking" value={profile.lifestyle.smoking} />
                <Row label="Drinking" value={profile.lifestyle.drinking} />
                <Row label="Diet" value={profile.lifestyle.diet} />
            </Section>

            {/* Family Background */}
            <Section title="Family Background">
                <Row label="Father" value={profile.family.fatherStatus} />
                <Row label="Mother" value={profile.family.motherStatus} />
                <Row label="Siblings" value={profile.family.siblings} />
                <Row label="Family Type" value={profile.family.familyType} />
                <Row label="Family Values" value={profile.family.familyValues} />
            </Section>

            {/* Interests & Hobbies */}
            <Section title="Interests & Hobbies">
                <Row label="Hobbies" value={profile.interests.hobbies} />
                <Row label="Music" value={profile.interests.music} />
                <Row label="Movies" value={profile.interests.movies} />
                <Row label="Sports" value={profile.interests.sports} />
            </Section>

            {/* Partner Preferences */}
            <Section title="Partner Preferences">
                <Row label="Age Range" value={profile.partnerPreferences.ageRange} />
                <Row label="Height Range" value={profile.partnerPreferences.heightRange} />
                <Row label="Religion" value={profile.partnerPreferences.religion} />
                <Row label="Caste" value={profile.partnerPreferences.caste} />
                <Row label="Education" value={profile.partnerPreferences.education} />
                <Row label="Profession" value={profile.partnerPreferences.profession} />
                <Row label="Marital Status" value={profile.partnerPreferences.maritalStatus} />
                <Row label="Location" value={profile.partnerPreferences.location} />
                <Row label="Body Type" value={profile.partnerPreferences.bodyType} />
                <Row label="Complexion" value={profile.partnerPreferences.complexion} />
                <Row label="Diet" value={profile.partnerPreferences.diet} />
                <Row label="Smoking" value={profile.partnerPreferences.smoking} />
                <Row label="Drinking" value={profile.partnerPreferences.drinking} />
                <Row label="Family Type" value={profile.partnerPreferences.familyType} />
            </Section>

            <View style={{ height: 24 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f5f6fa",
    },
    carousel: {
        backgroundColor: "#000",
    },
    photo: {
        width,
        height: 420,
        resizeMode: "cover",
    },
    header: {
        backgroundColor: "#fff",
        padding: 16,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    name: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111",
    },
    subText: {
        marginTop: 4,
        color: "#666",
        fontSize: 14,
    },
    section: {
        marginTop: 12,
    },
    sectionTitle: {
        paddingHorizontal: 16,
        marginBottom: 6,
        fontSize: 15,
        fontWeight: "600",
        color: "#444",
    },
    card: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderColor: "#eee",
    },
    label: {
        color: "#777",
        fontSize: 14,
    },
    value: {
        color: "#111",
        fontSize: 14,
        fontWeight: "500",
        maxWidth: "55%",
        textAlign: "right",
    },
    aboutText: {
        color: "#333",
        fontSize: 14,
        lineHeight: 20,
    },
});
