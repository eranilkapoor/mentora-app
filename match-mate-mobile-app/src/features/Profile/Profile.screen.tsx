import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';
import {
  annualIncomeFormat,
  cmToFeetInches,
  formatAboutMe,
  formatCamelCase,
  formatLifestyleChoice,
  formatMaritalStatus,
  formatWeight,
  getAgeFromDOB,
  getFullName,
} from '../../core/utils/format';
import Header from '../../core/components/Header';
import { useGetMyProfileQuery } from '../../store/services/profileApi';
import {
  Countries,
  Genders,
  MaritalStatuses,
  ProfileData,
  Religions,
  SmokingHabits,
  DrinkingHabits
} from '../../core/types';
import { windowWidth } from '../../core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from './Profile.styles';
import { ProfileScreenProps } from './Profile.types';
import { FALLBACK_PHOTOS } from './Profile.constants';
import { ProfileSkeleton } from './components/ProfileSkeleton';
import { Section } from './components/Section';
import { Row } from './components/Row';
import { TagList } from './components/TagList';

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen({
  navigation,
}: ProfileScreenProps): React.ReactElement {
  const [profileData, setProfileData] = useState<ProfileData>({
    personal: {
      profileFor: 'self',
      firstName: '',
      lastName: '',
      gender: Genders.MALE,
      dateOfBirth: '',
      country: Countries.INDIA,
      state: '',
      city: '',
      motherTongue: '',
      maritalStatus: MaritalStatuses.NEVER_MARRIED,
      aboutMe: '',
      smoking: SmokingHabits.NON_SMOKER,
      drinking: DrinkingHabits.NON_DRINKER,
      diet: '',
      hobbies: [],
      languagesKnown: [],
    },
    religion: Religions.HINDU,
    caste: '',
    physical: {
      height: '',
      weight: '',
      bodyType: '',
      complexion: '',
    },
    education: {
      qualification: '',
      field: '',
      university: '',
      occupation: '',
      annualIncome: '',
    },
    family: {
      fatherName: '',
      motherName: '',
      fatherOccupation: '',
      motherOccupation: '',
      familyType: '',
      familyStatus: '',
      familyValues: '',
    },
    preferences: {
      languagesKnown: [],
    },
    images: [],
  });
  const styles = useThemedStyles(profileStyles);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const { data, isLoading, isError } = useGetMyProfileQuery();

  const fetchProfile = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      if (data && !isLoading && !isError) {
        if (data?.success) {
          setProfileData(data.data);
        }
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } catch {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [data, isLoading, isError]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const photos: string[] =
    profileData?.images?.length > 0
      ? profileData.images
          .filter((img) => img.isActive !== false)
          .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
          .map((img) => {
            return 'http://192.168.1.10:3000' + img.url;
          }) // extract URL string from ProfileImage
      : FALLBACK_PHOTOS;

  const renderPhoto: ListRenderItem<string> = useCallback(
    ({ item, index }) => (
      <Image
        source={{ uri: item }}
        style={styles.photo}
        resizeMode="cover"
        accessibilityLabel={`Profile photo ${index + 1}`}
      />
    ),
    [styles]
  );

  // ─── Error state ─────────────────────────────────────────────────────────

  if (!loading && error !== null) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color={Colors.danger} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            void fetchProfile();
          }}
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header
          title="My Profile"
          actions={[
            {
              icon: 'settings',
              onPress: () => navigation.navigate('Settings'),
            },
          ]}
        />
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <Header
        title="My Profile"
        actions={[
          {
            icon: 'settings',
            onPress: () => navigation.navigate('Settings'),
          },
        ]}
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photo Carousel */}
        <View>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderPhoto}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / windowWidth
              );
              setActivePhotoIndex(index);
            }}
            scrollEventThrottle={16}
          />
          {/* Dot Indicators */}
          {photos.length > 1 && (
            <View style={styles.dotRow}>
              {photos.map((_, i) => (
                <View
                  key={i.toString()}
                  style={[
                    styles.dot,
                    i === activePhotoIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Name & Basic */}
        <View style={styles.nameCard}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {getFullName(
                profileData?.personal.firstName ?? '',
                profileData?.personal.lastName ?? ''
              )}
            </Text>
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={14} color={Colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <Text style={styles.subText}>
            {getAgeFromDOB(profileData?.personal.dateOfBirth)} •{' '}
            {cmToFeetInches(profileData?.physical.height ?? 150)} •{' '}
            {formatMaritalStatus(profileData?.personal.maritalStatus)}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={Colors.textMuted} />
            <Text style={styles.locationText}>
              {[
                formatCamelCase(profileData?.personal.city),
                formatCamelCase(profileData?.personal.state),
                formatCamelCase(profileData?.personal.country),
              ]
                .filter(Boolean)
                .join(', ') || '—'}
            </Text>
          </View>
        </View>

        {/* About */}
        <Section title="About Me" icon="user">
          <Text style={styles.aboutText}>
            {formatAboutMe(profileData?.personal.aboutMe)}
          </Text>
        </Section>

        {/* Religious & Social */}
        <Section title="Religious & Social Background" icon="sun">
          <Row
            label="Religion"
            value={formatCamelCase(profileData?.religion)}
          />
          <Row label="Caste" value={formatCamelCase(profileData?.caste)} />
          <Row
            label="Mother Tongue"
            value={formatCamelCase(profileData?.personal.motherTongue)}
          />
        </Section>

        {/* Education & Career */}
        <Section title="Education & Career" icon="book">
          <Row
            label="Education"
            value={formatCamelCase(profileData?.education.qualification)}
          />
          <Row
            label="College"
            value={formatCamelCase(profileData?.education.university)}
          />
          <Row
            label="Profession"
            value={formatCamelCase(profileData?.education.occupation)}
          />
          <Row
            label="Annual Income"
            value={annualIncomeFormat(
              profileData?.education.annualIncome ?? ''
            )}
          />
        </Section>

        {/* Physical Attributes */}
        <Section title="Physical Attributes" icon="activity">
          <Row
            label="Height"
            value={cmToFeetInches(profileData?.physical.height ?? 150)}
          />
          <Row
            label="Weight"
            value={formatWeight(profileData?.physical.weight ?? 40)}
          />
          <Row
            label="Body Type"
            value={formatCamelCase(profileData?.physical.bodyType)}
          />
          <Row
            label="Complexion"
            value={formatCamelCase(profileData?.physical.complexion)}
          />
        </Section>

        {/* Lifestyle */}
        <Section title="Lifestyle" icon="coffee">
          <Row
            label="Smoking"
            value={formatLifestyleChoice(profileData?.personal.smoking ?? '')}
          />
          <Row
            label="Drinking"
            value={formatLifestyleChoice(profileData?.personal.drinking ?? '')}
          />
          <Row
            label="Diet"
            value={formatLifestyleChoice(profileData?.personal.diet ?? '')}
          />
        </Section>

        {/* Family Background */}
        <Section title="Family Background" icon="home">
          <Row
            label="Father's Name"
            value={formatCamelCase(profileData?.family.fatherName ?? '')}
          />
          <Row
            label="Mother's Name"
            value={formatCamelCase(profileData?.family.motherName ?? '')}
          />
          <Row
            label="Father's Occupation"
            value={formatCamelCase(profileData?.family.fatherOccupation ?? '')}
          />
          <Row
            label="Mother's Occupation"
            value={formatCamelCase(profileData?.family.motherOccupation ?? '')}
          />
          <Row
            label="Family Type"
            value={formatCamelCase(profileData?.family.familyType ?? '')}
          />
          <Row
            label="Family Status"
            value={formatCamelCase(profileData?.family.familyStatus ?? '')}
          />
          <Row
            label="Family Values"
            value={formatCamelCase(profileData?.family.familyValues ?? '')}
          />
        </Section>

        {/* Interests & Hobbies */}
        <Section title="Interests & Hobbies" icon="music">
          {(profileData?.personal.hobbies?.length ?? 0) > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Hobbies</Text>
              <TagList items={profileData?.personal.hobbies ?? []} />
            </View>
          )}
          <Row
            label="Languages Known"
            value={profileData?.personal.languagesKnown}
          />
        </Section>
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
