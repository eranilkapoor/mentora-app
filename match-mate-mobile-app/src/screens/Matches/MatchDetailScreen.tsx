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
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { windowWidth } from '../../core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchDetailStyles } from './MatchDetailScreen.styles';
import { Colors } from '../../core/constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  ChatScreen: { userId: string; partnerName: string; partnerPhoto: string };
  RequestContact: { userId: string };
};

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

interface RowProps {
  label: string;
  value: string;
  icon?: string;
  isLast?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PHOTOS = [
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/women/66.jpg',
  'https://randomuser.me/api/portraits/women/67.jpg',
];

const CHIPS = [
  { icon: 'sun', label: 'Hindu' },
  { icon: 'users', label: 'Brahmin' },
  { icon: 'trending-up', label: '5\'4"' },
  { icon: 'heart', label: 'Never Married' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, icon, children }: SectionProps): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={Colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ label, value, icon, isLast }: RowProps): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowLeft}>
        {icon !== undefined && (
          <Feather name={icon} size={13} color={Colors.textMuted} />
        )}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function MatchDetailsScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const index = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    setActiveIndex(index);
  };

  const renderPhoto: ListRenderItem<string> = ({ item }) => (
    <Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Carousel ─────────────────────────────────────────────── */}
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

          {/* Counter */}
          <View style={styles.counterPill}>
            <Feather name="image" size={11} color={Colors.white} />
            <Text style={styles.counterText}>
              {activeIndex + 1} / {PHOTOS.length}
            </Text>
          </View>

          {/* Dots */}
          <View style={styles.dots}>
            {PHOTOS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            ))}
          </View>

          {/* Hero Overlay */}
          <View style={styles.heroOverlay}>
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlinePillText}>Online now</Text>
            </View>
            <Text style={styles.heroName}>Priya Sharma, 28</Text>
            <View style={styles.heroLocationRow}>
              <Feather
                name="map-pin"
                size={13}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.heroLocation}>Mumbai, India</Text>
            </View>
          </View>
        </View>

        {/* ── Match Score Bar ───────────────────────────────────────── */}
        <View style={styles.matchScoreBar}>
          <View style={styles.matchScoreLeft}>
            <View style={styles.matchScoreIconWrapper}>
              <Feather name="heart" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.matchScoreLabel}>Match Score</Text>
              <Text style={styles.matchScoreValue}>92%</Text>
            </View>
          </View>
          <View style={styles.matchScoreDivider} />
          <View style={styles.matchScoreLeft}>
            <View style={styles.matchScoreIconWrapper}>
              <Feather name="eye" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.matchScoreLabel}>Profile Views</Text>
              <Text style={styles.matchScoreValue}>48</Text>
            </View>
          </View>
          <View style={styles.matchScoreDivider} />
          <View style={styles.matchScoreLeft}>
            <View style={styles.matchScoreIconWrapper}>
              <Feather name="star" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.matchScoreLabel}>Shortlists</Text>
              <Text style={styles.matchScoreValue}>12</Text>
            </View>
          </View>
        </View>

        {/* ── Chips ────────────────────────────────────────────────── */}
        <View style={styles.chipsRow}>
          {CHIPS.map((chip) => (
            <View key={chip.label} style={styles.chip}>
              <Feather name={chip.icon} size={12} color={Colors.primary} />
              <Text style={styles.chipText}>{chip.label}</Text>
            </View>
          ))}
        </View>

        {/* ── About ────────────────────────────────────────────────── */}
        <Section title="About Me" icon="user">
          <Text style={styles.aboutText}>
            Hi! I'm Priya, a software engineer based in Mumbai. I love
            travelling, reading, and exploring new cuisines. Looking for someone
            who values family and has a good sense of humour.
          </Text>
        </Section>

        {/* ── Basic Details ─────────────────────────────────────────── */}
        <Section title="Basic Details" icon="info">
          <Row label="Name" value="Priya Sharma" icon="user" />
          <Row label="Age" value="28 Years" icon="calendar" />
          <Row label="Height" value="5.4 ft" icon="trending-up" />
          <Row label="Religion" value="Hindu" icon="sun" />
          <Row label="Caste" value="Brahmin" icon="users" isLast />
        </Section>

        {/* ── Education & Career ────────────────────────────────────── */}
        <Section title="Education & Career" icon="book">
          <Row label="Education" value="B.Tech" icon="book" />
          <Row label="Profession" value="Software Engineer" icon="briefcase" />
          <Row
            label="Annual Income"
            value="₹12L – ₹15L"
            icon="dollar-sign"
            isLast
          />
        </Section>

        {/* ── Family ───────────────────────────────────────────────── */}
        <Section title="Family Background" icon="home">
          <Row label="Family Type" value="Nuclear" icon="home" />
          <Row label="Family Status" value="Middle Class" icon="shield" />
          <Row
            label="Father's Occupation"
            value="Business"
            icon="briefcase"
            isLast
          />
        </Section>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={styles.ctaOutline}
          onPress={() =>
            navigation.navigate('ChatScreen', {
              userId: '1',
              partnerName: 'Priya Sharma',
              partnerPhoto: PHOTOS[0],
            })
          }
          accessibilityRole="button"
        >
          <Feather name="message-circle" size={16} color={Colors.primary} />
          <Text style={styles.ctaOutlineText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaPrimary}
          onPress={() => navigation.navigate('RequestContact', { userId: '1' })}
          accessibilityRole="button"
        >
          <Feather name="heart" size={16} color={Colors.white} />
          <Text style={styles.ctaPrimaryText}>Send Interest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
