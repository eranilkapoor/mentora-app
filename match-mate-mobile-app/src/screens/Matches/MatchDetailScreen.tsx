import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';

const { width } = Dimensions.get('window');

const PHOTOS = [
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/women/66.jpg',
  'https://randomuser.me/api/portraits/women/67.jpg',
];

export default function MatchDetailsScreen() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <ScrollView style={styles.container}>
      {/* PHOTO CAROUSEL */}
      <FlatList
        data={PHOTOS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.photo} />
        )}
      />

      {/* DOT INDICATORS */}
      <View style={styles.dots}>
        {PHOTOS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.activeDot]}
          />
        ))}
      </View>

      {/* BASIC INFO */}
      <Section title="Basic Details">
        <Row label="Name" value="Priya Sharma" />
        <Row label="Age" value="28 Years" />
        <Row label="Height" value="5'4" />
        <Row label="Marital Status" value="Never Married" />
        <Row label="Religion" value="Hindu" />
        <Row label="Caste" value="Brahmin" />
        <Row label="Location" value="Mumbai, India" />
      </Section>

      {/* EDUCATION */}
      <Section title="Education & Career">
        <Row label="Education" value="B.Tech - Computer Science" />
        <Row label="Profession" value="Software Engineer" />
        <Row label="Company" value="MNC Company" />
        <Row label="Income" value="₹12 LPA" />
      </Section>

      {/* FAMILY */}
      <Section title="Family Details">
        <Row label="Father" value="Businessman" />
        <Row label="Mother" value="Homemaker" />
        <Row label="Siblings" value="1 Brother" />
        <Row label="Family Type" value="Nuclear" />
      </Section>

      {/* ABOUT */}
      <Section title="About Me">
        <Text style={styles.aboutText}>
          I am a caring and family-oriented person who believes in mutual
          respect and understanding.
        </Text>
      </Section>
    </ScrollView>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  photo: {
    width,
    height: 350,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#e91e63',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#e91e63',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    color: '#666',
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutText: {
    color: '#444',
    lineHeight: 20,
  },
});
