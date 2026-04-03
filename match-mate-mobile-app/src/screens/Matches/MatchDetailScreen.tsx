import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { Colors } from '../../core/constants/colors';
import { windowWidth } from '../../core/utils/device';

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Components ───────────────────────────────────────────────────────────────

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
    const index = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    setActiveIndex(index);
  };

  const renderPhoto: ListRenderItem<string> = ({ item }) => (
    <Image source={{ uri: item }} style={styles.photo} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carousel */}
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

          <View style={styles.carouselScrim} />

          <View style={styles.counterPill}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {PHOTOS.length}
            </Text>
          </View>

          <View style={styles.dots}>
            {PHOTOS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.heroOverlay}>
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlinePillText}>Online now</Text>
            </View>
            <Text style={styles.heroName}>Priya Sharma, 28</Text>
            <Text style={styles.heroLocation}>📍 Mumbai, India</Text>
          </View>
        </View>

        {/* Chips */}
        <View style={styles.chipsRow}>
          {['Hindu', 'Brahmin', '5\'4"', 'Never Married'].map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        {/* Sections */}
        <Section title="Basic Details" icon="👤">
          <Row label="Name" value="Priya Sharma" />
          <Row label="Age" value="28 Years" />
          <Row label="Height" value="5.4 ft" />
        </Section>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={styles.ctaOutline}
          onPress={() => navigation.navigate('ChatScreen', { userId: '1' })}
        >
          <Text style={styles.ctaOutlineText}>💬 Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaPrimary}
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
  container: { flex: 1, backgroundColor: Colors.backgroundPage },

  photo: { width: windowWidth, height: 380 },

  carouselWrapper: { position: 'relative' },

  carouselScrim: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 160,
    backgroundColor: Colors.overlayDark,
  },

  counterPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: Colors.overlayDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  counterText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  sectionBody: {
    gap: 4, // spacing between rows (RN 0.71+)
  },

  dots: {
    position: 'absolute',
    bottom: 54,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },

  dotActive: {
    backgroundColor: Colors.white,
    width: 18,
  },

  heroOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },

  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.overlayDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 5,
  },

  onlinePillText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },

  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },

  heroLocation: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.85,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },

  chip: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  chipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  section: {
    backgroundColor: Colors.white,
    marginTop: 10,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },

  sectionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },

  label: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  value: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  cta: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },

  ctaOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 30,
    alignItems: 'center',
    padding: 13,
  },

  ctaOutlineText: {
    color: Colors.primary,
    fontWeight: '700',
  },

  ctaPrimary: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    alignItems: 'center',
    padding: 13,
    marginLeft: 10,
  },

  ctaPrimaryText: {
    color: Colors.white,
    fontWeight: '800',
  },
});
