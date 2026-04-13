import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';
import {
  useGetMyProfileQuery,
  useUpdatePersonalInfoMutation,
} from '../../store/services/profileApi';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { editProfileStyles } from './EditProfileScreen.styles';
import {
  EducationSection,
  FamilySection,
  PersonalSection,
  PhysicalSection,
  PreferencesSection,
  ProfileData,
  ProfileImage,
  SectionKey,
} from './EditProfile.types';
import {
  BODY_TYPE_OPTIONS,
  COMPLEXION_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  FAMILY_TYPE_OPTIONS,
  GENDER_OPTIONS,
  INITIAL_PROFILE,
  MARITAL_OPTIONS,
  SMOKING_OPTIONS,
} from './EditProfile.constants';
import { CompletionBar } from './components/CompletionBar';
import { SectionCard } from './components/SectionCard';
import { FormInput } from './components/FormInput';
import { SelectPill } from './components/SelectPill';
import { TagInput } from './components/TagInput';

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function EditProfileScreen(): React.ReactElement {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [sectionLoading, setSectionLoading] = useState<SectionKey | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { data } = useGetMyProfileQuery();
  const [updatePersonalInfo] = useUpdatePersonalInfoMutation();

  // ─── Load ─────────────────────────────────────────────────────────────────

  const loadProfile = useCallback(async (): Promise<void> => {
    try {
      const response = data;
      if (response !== null && response !== undefined) {
        setProfile((prev) => ({ ...prev, ...response }));
      }
    } catch {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setPageLoading(false);
    }
  }, [data]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // ─── Completion ───────────────────────────────────────────────────────────

  const profileCompletion = useMemo((): number => {
    const checks: unknown[] = [
      profile.personal.firstName,
      profile.personal.gender,
      profile.personal.dob,
      profile.personal.religion,
      profile.personal.city,
      profile.physical.height,
      profile.physical.bodyType,
      profile.education.qualification,
      profile.education.occupation,
      profile.family.familyType,
      profile.preferences.hobbies.length > 0 ? 'yes' : '',
      profile.preferences.languagesKnown.length > 0 ? 'yes' : '',
      profile.images && profile.images.length > 0 ? 'yes' : '',
    ];

    const filled = checks.filter(
      (v) => v !== '' && v !== null && v !== undefined
    ).length;

    return Math.round((filled / checks.length) * 100);
  }, [profile]);

  // ─── Image Picker ─────────────────────────────────────────────────────────

  const pickImage = useCallback(async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 5],
    });

    if (!result.canceled && result.assets[0] !== undefined) {
      const newImage: ProfileImage = {
        uri: result.assets[0].uri,
        isPrimary: (profile.images ?? []).length === 0,
      };
      setProfile((p) => ({ ...p, images: [...(p.images ?? []), newImage] }));
    }
  }, [profile.images]);

  const setPrimary = useCallback((index: number): void => {
    setProfile((p) => ({
      ...p,
      images: (p.images ?? []).map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  }, []);

  const removeImage = useCallback((index: number): void => {
    setProfile((p) => {
      const updated = (p.images ?? []).filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0] = { ...updated[0], isPrimary: true };
      }
      return { ...p, images: updated };
    });
  }, []);

  // ─── Save ─────────────────────────────────────────────────────────────────

  const updateSection = useCallback(
    async (section: SectionKey): Promise<void> => {
      setSectionLoading(section);
      try {
        await updatePersonalInfo(profile.personal);
        Alert.alert(
          'Saved',
          `${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully.`
        );
      } catch {
        Alert.alert('Error', `Failed to update ${section}. Please try again.`);
      } finally {
        setSectionLoading(null);
      }
    },
    [profile, updatePersonalInfo]
  );

  const handleSave = useCallback(
    (key: SectionKey): void => {
      void updateSection(key);
    },
    [updateSection]
  );

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const setPersonal = useCallback(
    (key: keyof PersonalSection, value: string): void => {
      setProfile((p) => ({ ...p, personal: { ...p.personal, [key]: value } }));
    },
    []
  );

  const setPhysical = useCallback(
    (key: keyof PhysicalSection, value: string): void => {
      setProfile((p) => ({ ...p, physical: { ...p.physical, [key]: value } }));
    },
    []
  );

  const setEducation = useCallback(
    (key: keyof EducationSection, value: string): void => {
      setProfile((p) => ({
        ...p,
        education: { ...p.education, [key]: value },
      }));
    },
    []
  );

  const setFamily = useCallback(
    (key: keyof FamilySection, value: string): void => {
      setProfile((p) => ({ ...p, family: { ...p.family, [key]: value } }));
    },
    []
  );

  const setPreferences = useCallback(
    (key: keyof PreferencesSection, value: string | string[]): void => {
      setProfile((p) => ({
        ...p,
        preferences: { ...p.preferences, [key]: value },
      }));
    },
    []
  );

  const sectionProps = { sectionLoading, onSave: handleSave };
  const styles = useThemedStyles(editProfileStyles);

  // ─── Loading state ────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Completion Bar */}
          <CompletionBar percent={profileCompletion} />

          {/* ── Photos ─────────────────────────────────────────────────── */}
          <SectionCard
            title="Profile Photos"
            icon="camera"
            sectionKey="images"
            {...sectionProps}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoRow}
            >
              {(profile.images ?? []).map((img, index) => (
                <View key={img.uri} style={styles.photoWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.photo} />
                  {img.isPrimary === true && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                  <View style={styles.photoActions}>
                    <TouchableOpacity
                      style={styles.photoActionBtn}
                      onPress={() => setPrimary(index)}
                      accessibilityRole="button"
                      accessibilityLabel="Set as primary photo"
                    >
                      <Feather name="star" size={12} color={Colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.photoActionBtn,
                        styles.photoActionBtnDanger,
                      ]}
                      onPress={() => removeImage(index)}
                      accessibilityRole="button"
                      accessibilityLabel="Remove photo"
                    >
                      <Feather name="trash-2" size={12} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addPhotoBtn}
                onPress={() => {
                  void pickImage();
                }}
                accessibilityRole="button"
                accessibilityLabel="Add photo"
              >
                <Feather name="plus" size={28} color={Colors.textMuted} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            </ScrollView>
            <Text style={styles.photoHint}>
              Tap a photo to set as primary. First photo is shown on your
              profile card.
            </Text>
          </SectionCard>

          {/* ── Personal ───────────────────────────────────────────────── */}
          <SectionCard
            title="Personal Info"
            icon="user"
            sectionKey="personal"
            {...sectionProps}
          >
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label="First Name *"
                  value={profile.personal.firstName}
                  onChange={(v) => setPersonal('firstName', v)}
                  placeholder="John"
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label="Last Name"
                  value={profile.personal.lastName}
                  onChange={(v) => setPersonal('lastName', v)}
                  placeholder="Doe"
                />
              </View>
            </View>

            <FormInput
              label="Date of Birth"
              value={profile.personal.dob}
              onChange={(v) => setPersonal('dob', v)}
              placeholder="YYYY-MM-DD"
            />

            <SelectPill
              label="Gender"
              options={GENDER_OPTIONS}
              value={profile.personal.gender}
              onChange={(v) => setPersonal('gender', v)}
            />

            <SelectPill
              label="Marital Status"
              options={MARITAL_OPTIONS}
              value={profile.personal.maritalStatus}
              onChange={(v) => setPersonal('maritalStatus', v)}
            />

            <FormInput
              label="Religion"
              value={profile.personal.religion}
              onChange={(v) => setPersonal('religion', v)}
            />

            <FormInput
              label="Caste"
              value={profile.personal.caste}
              onChange={(v) => setPersonal('caste', v)}
            />

            <FormInput
              label="Mother Tongue"
              value={profile.personal.motherTongue}
              onChange={(v) => setPersonal('motherTongue', v)}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label="Country"
                  value={profile.personal.country}
                  onChange={(v) => setPersonal('country', v)}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label="State"
                  value={profile.personal.state}
                  onChange={(v) => setPersonal('state', v)}
                />
              </View>
            </View>

            <FormInput
              label="City"
              value={profile.personal.city}
              onChange={(v) => setPersonal('city', v)}
            />

            <FormInput
              label="About Me"
              value={profile.personal.aboutMe}
              onChange={(v) => setPersonal('aboutMe', v)}
              multiline
              placeholder="Tell us about yourself..."
            />
          </SectionCard>

          {/* ── Physical ───────────────────────────────────────────────── */}
          <SectionCard
            title="Physical Details"
            icon="activity"
            sectionKey="physical"
            {...sectionProps}
          >
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label="Height (cm)"
                  value={profile.physical.height}
                  onChange={(v) => setPhysical('height', v)}
                  keyboardType="numeric"
                  placeholder="e.g. 165"
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label="Weight (kg)"
                  value={profile.physical.weight}
                  onChange={(v) => setPhysical('weight', v)}
                  keyboardType="numeric"
                  placeholder="e.g. 60"
                />
              </View>
            </View>

            <SelectPill
              label="Body Type"
              options={BODY_TYPE_OPTIONS}
              value={profile.physical.bodyType}
              onChange={(v) => setPhysical('bodyType', v)}
            />

            <SelectPill
              label="Complexion"
              options={COMPLEXION_OPTIONS}
              value={profile.physical.complexion}
              onChange={(v) => setPhysical('complexion', v)}
            />
          </SectionCard>

          {/* ── Education ──────────────────────────────────────────────── */}
          <SectionCard
            title="Education & Career"
            icon="book"
            sectionKey="education"
            {...sectionProps}
          >
            <FormInput
              label="Qualification"
              value={profile.education.qualification}
              onChange={(v) => setEducation('qualification', v)}
              placeholder="e.g. B.Tech, MBA"
            />

            <FormInput
              label="Field of Study"
              value={profile.education.field}
              onChange={(v) => setEducation('field', v)}
              placeholder="e.g. Computer Science"
            />

            <FormInput
              label="University / College"
              value={profile.education.university}
              onChange={(v) => setEducation('university', v)}
              placeholder="e.g. Delhi University"
            />

            <FormInput
              label="Occupation"
              value={profile.education.occupation}
              onChange={(v) => setEducation('occupation', v)}
              placeholder="e.g. Software Engineer"
            />

            <FormInput
              label="Annual Income"
              value={profile.education.annualIncome}
              onChange={(v) => setEducation('annualIncome', v)}
              keyboardType="numeric"
              placeholder="e.g. 800000"
            />
          </SectionCard>

          {/* ── Family ─────────────────────────────────────────────────── */}
          <SectionCard
            title="Family Background"
            icon="home"
            sectionKey="family"
            {...sectionProps}
          >
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label="Father's Name"
                  value={profile.family.fatherName}
                  onChange={(v) => setFamily('fatherName', v)}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label="Mother's Name"
                  value={profile.family.motherName}
                  onChange={(v) => setFamily('motherName', v)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label="Father's Occupation"
                  value={profile.family.fatherOccupation}
                  onChange={(v) => setFamily('fatherOccupation', v)}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label="Mother's Occupation"
                  value={profile.family.motherOccupation}
                  onChange={(v) => setFamily('motherOccupation', v)}
                />
              </View>
            </View>

            <SelectPill
              label="Family Type"
              options={FAMILY_TYPE_OPTIONS}
              value={profile.family.familyType}
              onChange={(v) => setFamily('familyType', v)}
            />

            <FormInput
              label="Family Status"
              value={profile.family.familyStatus}
              onChange={(v) => setFamily('familyStatus', v)}
              placeholder="e.g. Middle Class"
            />

            <FormInput
              label="Family Values"
              value={profile.family.familyValues}
              onChange={(v) => setFamily('familyValues', v)}
              placeholder="e.g. Traditional, Modern"
            />
          </SectionCard>

          {/* ── Lifestyle & Preferences ────────────────────────────────── */}
          <SectionCard
            title="Lifestyle & Preferences"
            icon="coffee"
            sectionKey="preferences"
            {...sectionProps}
          >
            <SelectPill
              label="Smoking"
              options={SMOKING_OPTIONS}
              value={profile.preferences.smoking}
              onChange={(v) => setPreferences('smoking', v)}
            />

            <SelectPill
              label="Drinking"
              options={DRINKING_OPTIONS}
              value={profile.preferences.drinking}
              onChange={(v) => setPreferences('drinking', v)}
            />

            <SelectPill
              label="Diet"
              options={DIET_OPTIONS}
              value={profile.preferences.diet}
              onChange={(v) => setPreferences('diet', v)}
            />

            <TagInput
              label="Hobbies"
              items={profile.preferences.hobbies}
              setItems={(v) => setPreferences('hobbies', v)}
              placeholder="e.g. Reading, Yoga..."
            />

            <TagInput
              label="Languages Known"
              items={profile.preferences.languagesKnown}
              setItems={(v) => setPreferences('languagesKnown', v)}
              placeholder="e.g. Hindi, English..."
            />
          </SectionCard>

          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
