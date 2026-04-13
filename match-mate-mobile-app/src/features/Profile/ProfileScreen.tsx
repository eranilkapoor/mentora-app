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
  formatAgeRange,
  formatLifestyleChoice,
  formatMaritalStatus,
  formatWeight,
  getAgeFromDOB,
  getFullName,
} from '../../core/utils/format';
import Header from '../../core/components/Header';
import { useGetMyProfileQuery } from '../../store/services/profileApi';
import { ProfileData } from '../../core/types';
import { windowWidth } from '../../core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from './ProfileScreen.styles';
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
      profileFor: 'Self',
      firstName: '',
      lastName: '',
      gender: 'other',
      dob: '',
      religion: '',
      caste: '',
      country: '',
      state: '',
      city: '',
      motherTongue: '',
      maritalStatus: 'never_married',
      aboutMe: '',
    },
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
      smoking: 'non_smoker',
      drinking: 'non_drinker',
      diet: 'non_vegetarian',
      languagesKnown: [],
      hobbies: [],
      music: [],
      movies: [],
      sports: [],
      partnerPreference: {
        ageRange: { min: 18, max: 100 },
        heightRange: { min: 150, max: 250 },
      },
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
        // Map API response to ProfileData structure
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
            console.log('📸 Image URL:', img.url); // ← check this in logs
            return 'http://192.168.1.4:3000' + img.url;
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
          onNotifications={() => navigation.navigate('Notifications' as never)}
          onSettings={() => navigation.navigate('Settings' as never)}
          hasUnread
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
        onNotifications={() => navigation.navigate('Notifications' as never)}
        onSettings={() => navigation.navigate('Settings' as never)}
        hasUnread
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
            {getAgeFromDOB(profileData?.personal.dob)} •{' '}
            {cmToFeetInches(profileData?.physical.height ?? 150)} •{' '}
            {formatMaritalStatus(profileData?.personal.maritalStatus)}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={Colors.textMuted} />
            <Text style={styles.locationText}>
              {[
                profileData?.personal.city,
                profileData?.personal.state,
                profileData?.personal.country,
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
          <Row label="Religion" value={profileData?.personal.religion} />
          <Row label="Caste" value={profileData?.personal.caste} />
          <Row
            label="Mother Tongue"
            value={profileData?.personal.motherTongue}
          />
        </Section>

        {/* Education & Career */}
        <Section title="Education & Career" icon="book">
          <Row label="Education" value={profileData?.education.qualification} />
          <Row label="College" value={profileData?.education.university} />
          <Row label="Profession" value={profileData?.education.occupation} />
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
          <Row label="Body Type" value={profileData?.physical.bodyType} />
          <Row label="Complexion" value={profileData?.physical.complexion} />
        </Section>

        {/* Lifestyle */}
        <Section title="Lifestyle" icon="coffee">
          <Row
            label="Smoking"
            value={formatLifestyleChoice(
              profileData?.preferences.smoking ?? ''
            )}
          />
          <Row
            label="Drinking"
            value={formatLifestyleChoice(
              profileData?.preferences.drinking ?? ''
            )}
          />
          <Row
            label="Diet"
            value={formatLifestyleChoice(profileData?.preferences.diet ?? '')}
          />
        </Section>

        {/* Family Background */}
        <Section title="Family Background" icon="home">
          <Row label="Father's Name" value={profileData?.family.fatherName} />
          <Row label="Mother's Name" value={profileData?.family.motherName} />
          <Row
            label="Father's Occupation"
            value={profileData?.family.fatherOccupation}
          />
          <Row
            label="Mother's Occupation"
            value={profileData?.family.motherOccupation}
          />
          <Row label="Family Type" value={profileData?.family.familyType} />
          <Row label="Family Status" value={profileData?.family.familyStatus} />
          <Row label="Family Values" value={profileData?.family.familyValues} />
        </Section>

        {/* Interests & Hobbies */}
        <Section title="Interests & Hobbies" icon="music">
          {(profileData?.preferences.hobbies?.length ?? 0) > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Hobbies</Text>
              <TagList items={profileData?.preferences.hobbies ?? []} />
            </View>
          )}
          {(profileData?.preferences.music?.length ?? 0) > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Music</Text>
              <TagList items={profileData?.preferences.music ?? []} />
            </View>
          )}
          {(profileData?.preferences.sports?.length ?? 0) > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Sports</Text>
              <TagList items={profileData?.preferences.sports ?? []} />
            </View>
          )}
          <Row
            label="Languages Known"
            value={profileData?.preferences.languagesKnown}
          />
        </Section>

        {/* Partner Preferences */}
        <Section title="Partner Preferences" icon="heart">
          <Row
            label="Age Range"
            value={formatAgeRange(
              profileData?.preferences?.partnerPreference?.ageRange?.min ?? 18,
              profileData?.preferences?.partnerPreference?.ageRange?.max ?? 35
            )}
          />
          <Row
            label="Height Range"
            value={
              profileData?.preferences.partnerPreference?.heightRange
                ? `${cmToFeetInches(profileData.preferences.partnerPreference.heightRange.min)} – ${cmToFeetInches(profileData.preferences.partnerPreference.heightRange.max)}`
                : '—'
            }
          />
          <Row
            label="Religion"
            value={profileData?.preferences.partnerPreference?.religion}
          />
          <Row
            label="Caste"
            value={profileData?.preferences.partnerPreference?.caste}
          />
          <Row
            label="Education"
            value={profileData?.preferences.partnerPreference?.qualification}
          />
          <Row
            label="Profession"
            value={profileData?.preferences.partnerPreference?.occupation}
          />
          <Row
            label="Marital Status"
            value={profileData?.preferences.partnerPreference?.maritalStatus}
          />
          <Row
            label="Location"
            value={profileData?.preferences.partnerPreference?.country}
          />
          <Row
            label="Body Type"
            value={profileData?.preferences.partnerPreference?.bodyType}
          />
          <Row
            label="Complexion"
            value={profileData?.preferences.partnerPreference?.complexion}
          />
          <Row
            label="Diet"
            value={profileData?.preferences.partnerPreference?.diet}
          />
          <Row
            label="Smoking"
            value={profileData?.preferences.partnerPreference?.smoking}
          />
          <Row
            label="Drinking"
            value={profileData?.preferences.partnerPreference?.drinking}
          />
        </Section>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
