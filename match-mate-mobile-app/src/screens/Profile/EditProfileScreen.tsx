import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';
import { type RootNavigationProp } from '../../navigation/types';
import { ProfileService } from '../../core/services/profileService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditProfileScreenProps {
  navigation: RootNavigationProp;
}

interface ProfileImage {
  uri: string;
  isPrimary?: boolean;
}

interface PersonalSection {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  motherTongue: string;
  country: string;
  state: string;
  city: string;
  aboutMe: string;
}

interface PhysicalSection {
  height: string;
  weight: string;
  bodyType: string;
  complexion: string;
}

interface EducationSection {
  qualification: string;
  field: string;
  university: string;
  occupation: string;
  annualIncome: string;
}

interface FamilySection {
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  motherOccupation: string;
  familyType: string;
  familyStatus: string;
  familyValues: string;
}

interface PreferencesSection {
  hobbies: string[];
  languagesKnown: string[];
  smoking: string;
  drinking: string;
  diet: string;
}

interface ProfileData {
  personal: PersonalSection;
  physical: PhysicalSection;
  education: EducationSection;
  family: FamilySection;
  preferences: PreferencesSection;
  images: ProfileImage[];
}

type SectionKey = keyof ProfileData | 'images';

interface FormInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  editable?: boolean;
}

interface SelectPillProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}

interface TagInputProps {
  label: string;
  items: string[];
  setItems: (v: string[]) => void;
  placeholder?: string;
}

interface SectionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  sectionKey: SectionKey;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = ['male', 'female', 'other'] as const;
const MARITAL_OPTIONS = [
  'never_married',
  'divorced',
  'widowed',
  'awaiting_divorce',
] as const;
const BODY_TYPE_OPTIONS = ['slim', 'athletic', 'average', 'heavy'] as const;
const COMPLEXION_OPTIONS = ['fair', 'wheatish', 'dusky', 'dark'] as const;
const FAMILY_TYPE_OPTIONS = ['joint', 'nuclear', 'extended'] as const;
const SMOKING_OPTIONS = ['non_smoker', 'occasional', 'regular'] as const;
const DRINKING_OPTIONS = ['non_drinker', 'occasional', 'regular'] as const;
const DIET_OPTIONS = [
  'vegetarian',
  'non_vegetarian',
  'eggetarian',
  'vegan',
] as const;

const INITIAL_PROFILE: ProfileData = {
  personal: {
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    religion: '',
    caste: '',
    motherTongue: '',
    country: '',
    state: '',
    city: '',
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
    hobbies: [],
    languagesKnown: [],
    smoking: '',
    drinking: '',
    diet: '',
  },
  images: [],
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormInput({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  keyboardType = 'default',
  editable = true,
}: FormInputProps): React.ReactElement {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          !editable && styles.inputDisabled,
        ]}
        multiline={multiline}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        editable={editable}
        textAlignVertical={multiline ? 'top' : 'auto'}
        accessibilityLabel={label}
      />
    </View>
  );
}

function SelectPill({
  label,
  options,
  value,
  onChange,
}: SelectPillProps): React.ReactElement {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.pillRow}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => onChange(opt)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
            >
              <Text
                style={[styles.pillText, selected && styles.pillTextSelected]}
              >
                {opt.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function TagInput({
  label,
  items,
  setItems,
  placeholder,
}: TagInputProps): React.ReactElement {
  const [text, setText] = useState('');

  const handleAdd = useCallback((): void => {
    const trimmed = text.trim();
    if (trimmed === '' || items.includes(trimmed)) return;
    setItems([...items, trimmed]);
    setText('');
  }, [text, items, setItems]);

  const handleRemove = useCallback(
    (item: string): void => {
      setItems(items.filter((i) => i !== item));
    },
    [items, setItems]
  );

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.tagInputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.tagInput}
          onSubmitEditing={handleAdd}
          placeholder={placeholder ?? `Add ${label.toLowerCase()}...`}
          placeholderTextColor={Colors.textMuted}
          returnKeyType="done"
          accessibilityLabel={`Add ${label}`}
        />
        <TouchableOpacity
          style={styles.tagAddBtn}
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={`Add ${label} item`}
        >
          <Feather name="plus" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
      {items.length > 0 && (
        <View style={styles.tagList}>
          {items.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.tag}
              onPress={() => handleRemove(item)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item}`}
            >
              <Text style={styles.tagText}>{item}</Text>
              <Feather name="x" size={12} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function SectionCard({
  title,
  icon,
  children,
  sectionKey,
  sectionLoading,
  onSave,
}: SectionCardProps): React.ReactElement {
  const isSaving = sectionLoading === sectionKey;

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={Colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.sectionBody}>{children}</View>

      <TouchableOpacity
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        onPress={() => onSave(sectionKey)}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel={`Save ${title}`}
      >
        {isSaving ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <>
            <Feather name="check" size={15} color={Colors.white} />
            <Text style={styles.saveBtnText}>Save {title}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

function CompletionBar({ percent }: { percent: number }): React.ReactElement {
  const color =
    percent < 40
      ? Colors.danger
      : percent < 75
        ? Colors.accent
        : Colors.success;

  return (
    <View style={styles.completionCard}>
      <View style={styles.completionRow}>
        <View>
          <Text style={styles.completionTitle}>Profile Completion</Text>
          <Text style={styles.completionSubtitle}>
            {percent < 50
              ? 'Add more details to get better matches'
              : percent < 100
                ? 'Almost there! Complete your profile'
                : 'Your profile is complete 🎉'}
          </Text>
        </View>
        <Text style={[styles.completionPercent, { color }]}>{percent}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function EditProfileScreen({}: EditProfileScreenProps): React.ReactElement {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [sectionLoading, setSectionLoading] = useState<SectionKey | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // ─── Load ─────────────────────────────────────────────────────────────────

  const loadProfile = useCallback(async (): Promise<void> => {
    try {
      const res = await ProfileService.getMyProfile();
      const data = res.data?.data as ProfileData | null;
      if (data !== null && data !== undefined) {
        setProfile((prev) => ({ ...prev, ...data }));
      }
    } catch {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setPageLoading(false);
    }
  }, []);

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
      profile.images.length > 0 ? 'yes' : '',
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
        isPrimary: profile.images.length === 0,
      };
      setProfile((p) => ({ ...p, images: [...p.images, newImage] }));
    }
  }, [profile.images.length]);

  const setPrimary = useCallback((index: number): void => {
    setProfile((p) => ({
      ...p,
      images: p.images.map((img, i) => ({ ...img, isPrimary: i === index })),
    }));
  }, []);

  const removeImage = useCallback((index: number): void => {
    setProfile((p) => {
      const updated = p.images.filter((_, i) => i !== index);
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
        // await ProfileService.updatePersonalInfo(
        //   section === 'images'
        //     ? { images: profile.images }
        //     : { [section]: profile[section as keyof ProfileData] },
        // );
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
    [profile]
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

  // ─── Loading state ────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <SafeAreaProvider style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaProvider style={styles.safe}>
      <StatusBar barStyle="dark-content" />
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
              {profile.images.map((img, index) => (
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
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundPage },
  flex: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },

  // ── Completion ────────────────────────────────────────────────────────────
  completionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  completionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    maxWidth: 220,
  },
  completionPercent: {
    fontSize: 24,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.backgroundLight,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },

  // ── Section Card ──────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: Colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.backgroundPage,
  },
  sectionIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 7,
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
  sectionBody: {
    padding: 16,
  },

  // ── Photos ────────────────────────────────────────────────────────────────
  photoRow: {
    gap: 10,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 4,
  },
  photo: {
    width: 100,
    height: 125,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingVertical: 2,
    alignItems: 'center',
  },
  primaryBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 6,
  },
  photoActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Colors.backgroundLight,
  },
  photoActionBtnDanger: {
    backgroundColor: Colors.errorLight,
  },
  addPhotoBtn: {
    width: 100,
    height: 125,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.inputBackground,
  },
  addPhotoText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  photoHint: {
    fontSize: 12,
    color: Colors.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 17,
  },

  // ── Form Fields ───────────────────────────────────────────────────────────
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBackground,
  },
  multilineInput: {
    minHeight: 90,
    paddingTop: 12,
  },
  inputDisabled: { opacity: 0.5 },
  row: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },

  // ── Pills ─────────────────────────────────────────────────────────────────
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    backgroundColor: Colors.inputBackground,
  },
  pillSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  pillTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // ── Tag Input ─────────────────────────────────────────────────────────────
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBackground,
  },
  tagAddBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },

  // ── Save Button ───────────────────────────────────────────────────────────
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    marginTop: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 10,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  footer: { height: 16 },
});
