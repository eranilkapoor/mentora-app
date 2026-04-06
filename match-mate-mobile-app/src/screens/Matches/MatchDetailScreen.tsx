import React, { useState, useRef } from 'react';
import {
  View,
  Text,
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
import { windowWidth } from '../../core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchDetailStyles } from './MatchDetailScreen.styles';

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

const Section: React.FC<SectionProps> = ({ title, icon, children }) => {
  const styles = useThemedStyles(matchDetailStyles);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};

const Row: React.FC<RowProps> = ({ label, value }) => {
  const styles = useThemedStyles(matchDetailStyles);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MatchDetailsScreen({ navigation }: Props) {
  const styles = useThemedStyles(matchDetailStyles);

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
