import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ListRenderItem,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const PINK = '#C2185B';
const PINK_LIGHT = '#FCE4EC';
const RED = '#D32F2F';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  ChatScreen: { userId: string };
  RequestContact: { userId: string };
};

type Props = {
  navigation: NavigationProp<RootStackParamList>;
};

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

interface RowProps {
  label: string;
  value: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PHOTOS = [
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/women/66.jpg',
  'https://randomuser.me/api/portraits/women/67.jpg',
];

// ─── Reusable Components ──────────────────────────────────────────────────────

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const Row: React.FC<RowProps> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MatchDetailsScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const renderPhoto: ListRenderItem<string> = ({ item }) => (
    <Image source={{ uri: item }} style={styles.photo} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Photo Carousel ── */}
        <View style={styles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={PHOTOS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
            renderItem={renderPhoto}
            keyExtractor={(_, i) => String(i)}
          />

          {/* Scrim for readability of overlaid content */}
          <View style={styles.carouselScrim} />

          {/* Photo counter pill */}
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {PHOTOS.length}
            </Text>
          </View>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {PHOTOS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            ))}
          </View>

          {/* Name & location overlay */}
          <View style={styles.heroOverlay}>
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlinePillText}>Online now</Text>
            </View>
            <Text style={styles.heroName}>Priya Sharma, 28</Text>
            <Text style={styles.heroLocation}>📍 Mumbai, India</Text>
          </View>
        </View>

        {/* ── Quick chips ── */}
        <View style={styles.chipsRow}>
          {['Hindu', 'Brahmin', '5\'4"', 'Never Married'].map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        {/* ── Sections ── */}
        <Section title="Basic Details" icon="👤">
          <Row label="Name" value="Priya Sharma" />
          <Row label="Age" value="28 Years" />
          <Row label="Height" value="5.4 ft" />
          <Row label="Marital Status" value="Never Married" />
          <Row label="Religion" value="Hindu" />
          <Row label="Caste" value="Brahmin" />
          <Row label="Location" value="Mumbai, India" />
        </Section>

        <Section title="Education & Career" icon="🎓">
          <Row label="Education" value="B.Tech — Computer Science" />
          <Row label="Profession" value="Software Engineer" />
          <Row label="Company" value="MNC Company" />
          <Row label="Income" value="₹12 LPA" />
        </Section>

        <Section title="Family Details" icon="🏠">
          <Row label="Father" value="Businessman" />
          <Row label="Mother" value="Homemaker" />
          <Row label="Siblings" value="1 Brother" />
          <Row label="Family Type" value="Nuclear" />
        </Section>

        <Section title="About Me" icon="💬">
          <Text style={styles.aboutText}>
            I am a caring and family-oriented person who believes in mutual
            respect and understanding. Looking for a partner who values honesty
            and shared growth.
          </Text>
        </Section>

        {/* Bottom spacer for CTA */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={styles.ctaOutline}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ChatScreen', { userId: '1' })}
        >
          <Text style={styles.ctaOutlineText}>💬 Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaPrimary}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('RequestContact', { userId: '1' })}
        >
          <Text style={styles.ctaPrimaryText}>Send Interest →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { paddingBottom: 0 },

  // Carousel
  carouselWrapper: { position: 'relative' },
  photo: { width, height: 380 },
  carouselScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  counterPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  counterText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dots: {
    position: 'absolute',
    bottom: 54,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: '#fff', width: 18 },
  heroOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#66BB6A',
  },
  onlinePillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  heroName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroLocation: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Quick chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  chip: {
    backgroundColor: PINK_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: { fontSize: 12, color: PINK, fontWeight: '600' },

  // Sections
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  sectionBody: { gap: 2 },

  // Rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F8F8F8',
  },
  label: { fontSize: 13, color: '#888', flex: 1 },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'right',
  },

  aboutText: { fontSize: 14, color: '#444', lineHeight: 22 },

  // CTA
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  ctaOutline: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: RED,
    alignItems: 'center',
  },
  ctaOutlineText: { color: RED, fontWeight: '700', fontSize: 14 },
  ctaPrimary: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 30,
    backgroundColor: RED,
    alignItems: 'center',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
