import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { type RootNavigationProp } from '../../navigation/types';
import { ProfileService } from '../../services/profileService';
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
} from '../../utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileScreenProps {
  navigation: RootNavigationProp;
}

interface ProfilePersonal {
  firstName: string;
  lastName?: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  caste?: string;
  motherTongue?: string;
  country?: string;
  state?: string;
  city?: string;
  aboutMe?: string;
}

interface ProfilePhysical {
  height: number | string;
  weight?: number | string;
  bodyType?: string;
  complexion?: string;
}

interface ProfileEducation {
  education?: string;
  college?: string;
  occupation?: string;
  annualIncome?: string;
}

interface ProfileFamily {
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  familyType?: string;
  familyStatus?: string;
  familyValues?: string;
}

interface PartnerPreference {
  ageRange?: { min: number; max: number };
  heightRange?: { min: number; max: number };
  religion?: string[];
  caste?: string[];
  education?: string[];
  occupation?: string[];
  maritalStatus?: string[];
  country?: string[];
  bodyType?: string[];
  complexion?: string[];
  diet?: string[];
  smoking?: string[];
  drinking?: string[];
  familyType?: string[];
}

interface ProfilePreferences {
  smoking?: string;
  drinking?: string;
  diet?: string;
  languagesKnown?: string[];
  hobbies?: string[];
  music?: string[];
  movies?: string[];
  sports?: string[];
  partnerPreference?: PartnerPreference;
}

interface ProfileData {
  photos?: string[];
  personal: ProfilePersonal;
  physical: ProfilePhysical;
  education: ProfileEducation;
  family: ProfileFamily;
  preferences: ProfilePreferences;
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

interface RowProps {
  label: string;
  value?: string | string[] | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;

const FALLBACK_PHOTOS = [
  'https://ix-marketing.imgix.net/focalpoint.png?auto=format,compress&w=800',
  'https://ix-marketing.imgix.net/case-study_2.png?auto=format,compress&w=800',
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: SectionProps): React.ReactElement {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={Colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ label, value }: RowProps): React.ReactElement {
  const displayValue = Array.isArray(value)
    ? value.join(', ') || '—'
    : (value ?? '—');

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{displayValue}</Text>
    </View>
  );
}

function TagList({ items }: { items: string[] }): React.ReactElement {
  return (
    <View style={styles.tagList}>
      {items.map((item) => (
        <View key={item} style={styles.tag}>
          <Text style={styles.tagText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ProfileSkeleton(): React.ReactElement {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonPhoto} />
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen({
  navigation,
}: ProfileScreenProps): React.ReactElement {
  const [profileData, setProfileData] = useState<ProfileData>({
    personal: {
      firstName: '',
      dob: '',
      gender: '',
      maritalStatus: '',
      religion: '',
    },
    physical: {
      height: 0,
      weight: 0,
    },
    education: {
      education: '',
      college: '',
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
      smoking: '',
      drinking: '',
      diet: '',
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const fetchProfile = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await ProfileService.getMyProfile();
      const data = (response as { data: { data: ProfileData } }).data.data;
      setProfileData(data);
    } catch {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const photos =
    profileData?.photos?.length !== undefined && profileData.photos.length > 0
      ? profileData.photos
      : FALLBACK_PHOTOS;

  const renderPhoto: ListRenderItem<string> = useCallback(
    ({ item, index }) => (
      <Image
        source={{ uri: item }}
        style={styles.photo}
        accessibilityLabel={`Profile photo ${index + 1}`}
      />
    ),
    []
  );

  // ─── Error state ─────────────────────────────────────────────────────────

  if (!loading && error !== null) {
    return (
      <SafeAreaProvider style={styles.centerContainer}>
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
      </SafeAreaProvider>
    );
  }

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaProvider style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ProfileSkeleton />
      </SafeAreaProvider>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaProvider style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editButton}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Feather name="edit-2" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

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
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
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
                profileData?.personal.firstName ?? 'User',
                profileData?.personal.lastName ?? ''
              )}
            </Text>
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={14} color={Colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <Text style={styles.subText}>
            {getAgeFromDOB(profileData?.personal.dob)} yrs •{' '}
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
          <Row label="Education" value={profileData?.education.education} />
          <Row label="College" value={profileData?.education.college} />
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
            value={profileData?.preferences.partnerPreference?.education}
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
          <Row
            label="Family Type"
            value={profileData?.preferences.partnerPreference?.familyType}
          />
        </Section>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundPage,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: Colors.backgroundPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 30,
  },
  editButton: {
    padding: 4,
    width: 30,
    alignItems: 'flex-end',
  },
  photo: {
    width: SCREEN_WIDTH,
    height: 400,
    resizeMode: 'cover',
  },
  dotRow: {
    position: 'absolute',
    bottom: 12,
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
    backgroundColor: Colors.overlayDark,
  },
  dotActive: {
    backgroundColor: Colors.white,
    width: 18,
  },
  nameCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  subText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 8,
  },
  sectionIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  rowLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    flex: 1,
  },
  rowValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  aboutText: {
    color: Colors.textBody,
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: 10,
  },
  tagSection: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  tagSectionLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonPhoto: {
    width: SCREEN_WIDTH,
    height: 400,
    backgroundColor: Colors.backgroundLight,
  },
  skeletonHeader: {
    backgroundColor: Colors.white,
    padding: 16,
    gap: 8,
  },
  skeletonCard: {
    backgroundColor: Colors.white,
    padding: 16,
    marginTop: 12,
    gap: 8,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.backgroundLight,
    width: '80%',
  },
  skeletonLineShort: {
    width: '50%',
  },
  footer: {
    height: 24,
  },
});
