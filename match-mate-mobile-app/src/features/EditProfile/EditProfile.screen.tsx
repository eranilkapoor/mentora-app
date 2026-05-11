import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  useGetMyProfileQuery,
  useUpdatePersonalInfoMutation,
  useUpdatePhysicalInfoMutation,
  useUpdateEducationInfoMutation,
  useUpdateFamilyInfoMutation,
} from '@/store/services/profileApi';
import { SettingsStackParamList } from '@/navigation/types';
import { Country, MaritalStatusOptions, MaritalStatus, ProfileImage } from '@/core/types';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { editProfileStyles } from './EditProfile.styles';
import {
  EducationSection,
  FamilySection,
  PersonalSection,
  PhysicalSection,
  ProfileData,
  SectionKey,
} from './EditProfile.types';
import {
  BLOOD_GROUP_OPTIONS,
  BODY_TYPE_OPTIONS,
  COMPLEXION_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  FAMILY_STATUS_OPTIONS,
  FAMILY_TYPE_OPTIONS,
  FAMILY_VALUE_OPTIONS,
  MANGLIK_OPTIONS,
  INITIAL_PROFILE,
  OCCUPATION_TYPE_OPTIONS,
  SMOKING_OPTIONS,
} from './EditProfile.constants';
import { CompletionBar } from './components/CompletionBar';
import { SectionCard } from './components/SectionCard';
import { FormInput } from './components/FormInput';
import { SelectPill } from './components/SelectPill';
import { TagInput } from './components/TagInput';
import { TimeOfBirthPicker } from './components/TimeOfBirthPicker';
import { ToggleRow } from './components/ToggleRow';
import { NumberStepper } from './components/NumberStepper';
import { SiblingsEditor } from './components/SiblingsEditor';

type Props = {
  navigation: NativeStackNavigationProp<SettingsStackParamList, 'EditProfile'>;
};

export default function EditProfileScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [sectionLoading, setSectionLoading] = useState<SectionKey | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const { data, error, isLoading } = useGetMyProfileQuery();
  const [updatePersonalInfo] = useUpdatePersonalInfoMutation();
  const [updatePhysicalInfo] = useUpdatePhysicalInfoMutation();
  const [updateEducationInfo] = useUpdateEducationInfoMutation();
  const [updateFamilyInfo] = useUpdateFamilyInfoMutation();

  // ─── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      Alert.alert(t('common.error'), t('edit_profile.errors.load_failed'));
      setPageLoading(false);
      return;
    }

    if (data?.success && data?.data) {
      // setProfile((prev) => ({ ...prev, ...data.data }));
    }

    setPageLoading(false);
  }, [data, error, isLoading, t]);

  // ─── Completion ───────────────────────────────────────────────────────────

  const profileCompletion = useMemo((): number => {
    const checks: unknown[] = [
      profile.personal.firstName,
      profile.personal.dateOfBirth,
      profile.personal.maritalStatus,
      profile.personal.motherTongue,
      profile.personal.country,
      profile.physical.heightLabel,
      profile.physical.bodyType,
      profile.education.qualification,
      profile.education.occupation,
      profile.family.familyType,
      (profile.images ?? []).length > 0 ? 'yes' : '',
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
        t('edit_profile.photos.permission_title'),
        t('edit_profile.photos.permission_message')
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
        url: result.assets[0].uri,
        isPrimary: (profile.images ?? []).length === 0,
      };
      setProfile((p) => ({ ...p, images: [...(p.images ?? []), newImage] }));
    }
  }, [profile.images, t]);

  const setPrimary = useCallback((index: number) => {
    setProfile((p) => ({
      ...p,
      images: (p.images ?? []).map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  }, []);

  const removeImage = useCallback((index: number) => {
    setProfile((p) => {
      const updated = (p.images ?? []).filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0] = { ...updated[0], isPrimary: true };
      }
      return { ...p, images: updated };
    });
  }, []);

  // ─── Save — each section calls its own mutation ───────────────────────────

  const updateSection = useCallback(
    async (section: SectionKey): Promise<void> => {
      setSectionLoading(section);

      try {
        switch (section) {
          case 'personal':
            // await updatePersonalInfo({
            //   firstName: profile.personal.firstName,
            //   lastName: profile.personal.lastName ?? '',
            //   dateOfBirth: profile.personal.dateOfBirth,
            //   maritalStatus: profile.personal.maritalStatus as MaritalStatus,
            //   motherTongue: profile.personal.motherTongue ?? '',
            //   country: profile.personal.country as Country,
            //   state: profile.personal.state ?? '',
            //   aboutMe: profile.personal.aboutMe ?? '',
            // }).unwrap();
            break;
          case 'physical':
            // await updatePhysicalInfo(profile.physical).unwrap();
            break;
          case 'education':
            // await updateEducationInfo(profile.education).unwrap();
            break;
          case 'family':
            // await updateFamilyInfo(profile.family).unwrap();
            break;
          case 'images':
            // Handled inline
            break;
        }
        Alert.alert(t('common.saved'), t('edit_profile.success.section_saved'));
      } catch {
        Alert.alert(t('common.error'), t('edit_profile.errors.save_failed'));
      } finally {
        setSectionLoading(null);
      }
    },
    [
      profile,
      updatePersonalInfo,
      updatePhysicalInfo,
      updateEducationInfo,
      updateFamilyInfo,
      t,
    ]
  );

  const handleSave = useCallback(
    (key: SectionKey) => {
      void updateSection(key);
    },
    [updateSection]
  );

  // ─── Section setters ──────────────────────────────────────────────────────

  const setPersonal = useCallback(
    (
      key: keyof PersonalSection,
      value: PersonalSection[keyof PersonalSection]
    ) => {
      setProfile((p) => ({ ...p, personal: { ...p.personal, [key]: value } }));
    },
    []
  );

  const setPhysical = useCallback(
    (
      key: keyof PhysicalSection,
      value: PhysicalSection[keyof PhysicalSection]
    ) => {
      setProfile((p) => ({ ...p, physical: { ...p.physical, [key]: value } }));
    },
    []
  );

  const setEducation = useCallback(
    (
      key: keyof EducationSection,
      value: EducationSection[keyof EducationSection]
    ) => {
      setProfile((p) => ({
        ...p,
        education: { ...p.education, [key]: value },
      }));
    },
    []
  );

  const setFamily = useCallback(
    (key: keyof FamilySection, value: FamilySection[keyof FamilySection]) => {
      setProfile((p) => ({ ...p, family: { ...p.family, [key]: value } }));
    },
    []
  );

  const sectionProps = { sectionLoading, onSave: handleSave };

  if (pageLoading) {
    return (
      <Loader fullScreen size="large" loadingText={t('edit_profile.loading')} />
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
        <Header
          showBack
          onBackPress={navigation.goBack}
          title={t('edit_profile.title')}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CompletionBar percent={profileCompletion} />

          {/* ── Photos ─────────────────────────────────────────────────── */}
          <SectionCard
            title={t('edit_profile.sections.photos')}
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
                <View key={`${img.url}-${index}`} style={styles.photoWrapper}>
                  <Image source={{ uri: img.url }} style={styles.photo} />
                  {img.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>
                        {t('edit_profile.photos.primary')}
                      </Text>
                    </View>
                  )}
                  <View style={styles.photoActions}>
                    <TouchableOpacity
                      style={styles.photoActionBtn}
                      onPress={() => setPrimary(index)}
                      accessibilityRole="button"
                      accessibilityLabel={t('edit_profile.photos.set_primary')}
                    >
                      <Feather
                        name="star"
                        size={12}
                        color={theme.colors.accent}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.photoActionBtn,
                        styles.photoActionBtnDanger,
                      ]}
                      onPress={() => removeImage(index)}
                      accessibilityRole="button"
                      accessibilityLabel={t('edit_profile.photos.remove')}
                    >
                      <Feather
                        name="trash-2"
                        size={12}
                        color={theme.colors.danger}
                      />
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
                accessibilityLabel={t('edit_profile.photos.add')}
              >
                <Feather name="plus" size={28} color={theme.colors.textMuted} />
                <Text style={styles.addPhotoText}>
                  {t('edit_profile.photos.add')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <Text style={styles.photoHint}>
              {t('edit_profile.photos.hint')}
            </Text>
          </SectionCard>

          {/* ── Personal ───────────────────────────────────────────────── */}
          <SectionCard
            title={t('edit_profile.sections.personal')}
            icon="user"
            sectionKey="personal"
            {...sectionProps}
          >
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.first_name')}
                  value={profile.personal.firstName}
                  onChange={(v) => setPersonal('firstName', v)}
                  placeholder={t('edit_profile.placeholders.first_name')}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.last_name')}
                  value={profile.personal.lastName}
                  onChange={(v) => setPersonal('lastName', v)}
                  placeholder={t('edit_profile.placeholders.last_name')}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.dob')}
                  value={profile.personal.dateOfBirth}
                  onChange={(v) => setPersonal('dateOfBirth', v)}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={styles.halfField}>
                <TimeOfBirthPicker
                  value={profile.personal.timeOfBirth}
                  onChange={(val) => setPersonal('timeOfBirth', val)}
                />
              </View>
            </View>

            <SelectPill
              label={t('edit_profile.fields.marital_status')}
              options={MaritalStatusOptions}
              value={profile.personal.maritalStatus}
              onChange={(v) => setPersonal('maritalStatus', v)}
              i18nPrefix="options.marital"
            />

            <ToggleRow
              label={t('edit_profile.fields.has_children')}
              value={profile.personal.hasChildren}
              onChange={(v) => setPersonal('hasChildren', v)}
            />

            {profile.personal.hasChildren && (
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <NumberStepper
                    label={t('edit_profile.fields.sons_count')}
                    value={profile.personal.sonsCount}
                    onChange={(v) => setPersonal('sonsCount', v)}
                  />
                </View>
                <View style={styles.halfField}>
                  <NumberStepper
                    label={t('edit_profile.fields.daughters_count')}
                    value={profile.personal.daughtersCount}
                    onChange={(v) => setPersonal('daughtersCount', v)}
                  />
                </View>
              </View>
            )}

            <FormInput
              label={t('edit_profile.fields.mother_tongue')}
              value={profile.personal.motherTongue}
              onChange={(v) => setPersonal('motherTongue', v)}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.country')}
                  value={profile.personal.country}
                  onChange={(v) => setPersonal('country', v)}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.state')}
                  value={profile.personal.state}
                  onChange={(v) => setPersonal('state', v)}
                />
              </View>
            </View>

            <FormInput
              label={t('edit_profile.fields.citizenship')}
              value={profile.personal.citizenship}
              onChange={(v) => setPersonal('citizenship', v)}
            />

            <ToggleRow
              label={t('edit_profile.fields.willing_to_relocate')}
              value={profile.personal.willingToRelocate}
              onChange={(v) => setPersonal('willingToRelocate', v)}
            />

            <FormInput
              label={t('edit_profile.fields.about_me')}
              value={profile.personal.aboutMe}
              onChange={(v) => setPersonal('aboutMe', v)}
              multiline
              placeholder={t('edit_profile.placeholders.about_me')}
            />
          </SectionCard>

          {/* ── Astro / Religious ───────────────────────────────────────── */}
          <SectionCard
            title={t('edit_profile.sections.astro')}
            icon="moon"
            sectionKey="personal"
            {...sectionProps}
          >
            <SelectPill
              label={t('edit_profile.fields.manglik_status')}
              options={MANGLIK_OPTIONS}
              value={profile.personal.manglikStatus}
              onChange={(v) => setPersonal('manglikStatus', v)}
              i18nPrefix="options.manglik"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.rashi')}
                  value={profile.personal.rashi}
                  onChange={(v) => setPersonal('rashi', v)}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.nakshatra')}
                  value={profile.personal.nakshatra}
                  onChange={(v) => setPersonal('nakshatra', v)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.sub_cast')}
                  value={profile.personal.subCast}
                  onChange={(v) => setPersonal('subCast', v)}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.gotra')}
                  value={profile.personal.gotra}
                  onChange={(v) => setPersonal('gotra', v)}
                />
              </View>
            </View>

            {/* Place of birth */}
            <Text style={styles.subSectionLabel}>
              {t('edit_profile.fields.place_of_birth')}
            </Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.birth_city')}
                  value={profile.personal.placeOfBirth?.city}
                  onChange={(v) =>
                    setPersonal('placeOfBirth', {
                      ...profile.personal.placeOfBirth,
                      city: v,
                    })
                  }
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.birth_state')}
                  value={profile.personal.placeOfBirth?.state}
                  onChange={(v) =>
                    setPersonal('placeOfBirth', {
                      ...profile.personal.placeOfBirth,
                      state: v,
                    })
                  }
                />
              </View>
            </View>
            <FormInput
              label={t('edit_profile.fields.birth_country')}
              value={profile.personal.placeOfBirth?.country}
              onChange={(v) =>
                setPersonal('placeOfBirth', {
                  ...profile.personal.placeOfBirth,
                  country: v,
                })
              }
            />
          </SectionCard>

          {/* ── Physical ───────────────────────────────────────────────── */}
          <SectionCard
            title={t('edit_profile.sections.physical')}
            icon="activity"
            sectionKey="physical"
            {...sectionProps}
          >
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.height')}
                  value={profile.physical.heightLabel}
                  onChange={(v) => setPhysical('heightLabel', v)}
                  placeholder={t('edit_profile.placeholders.height')}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.weight')}
                  value={profile.physical.weightKg}
                  onChange={(v) => setPhysical('weightKg', v)}
                  keyboardType="numeric"
                  placeholder={t('edit_profile.placeholders.weight')}
                />
              </View>
            </View>

            <SelectPill
              label={t('edit_profile.fields.blood_group')}
              options={BLOOD_GROUP_OPTIONS}
              value={profile.physical.bloodGroup}
              onChange={(v) => setPhysical('bloodGroup', v)}
            />

            <SelectPill
              label={t('edit_profile.fields.body_type')}
              options={BODY_TYPE_OPTIONS}
              value={profile.physical.bodyType}
              onChange={(v) => setPhysical('bodyType', v)}
              i18nPrefix="options.body_type"
            />

            <SelectPill
              label={t('edit_profile.fields.complexion')}
              options={COMPLEXION_OPTIONS}
              value={profile.physical.complexion}
              onChange={(v) => setPhysical('complexion', v)}
              i18nPrefix="options.complexion"
            />

            <ToggleRow
              label={t('edit_profile.fields.disability_status')}
              value={profile.physical.disabilityStatus}
              onChange={(v) => setPhysical('disabilityStatus', v)}
            />

            {profile.physical.disabilityStatus && (
              <FormInput
                label={t('edit_profile.fields.disability_note')}
                value={profile.physical.disabilityNote}
                onChange={(v) => setPhysical('disabilityNote', v)}
                multiline
                placeholder={t('edit_profile.placeholders.disability_note')}
              />
            )}
          </SectionCard>

          {/* ── Education & Career ─────────────────────────────────────── */}
          <SectionCard
            title={t('edit_profile.sections.education')}
            icon="book"
            sectionKey="education"
            {...sectionProps}
          >
            <FormInput
              label={t('edit_profile.fields.qualification')}
              value={profile.education.qualification}
              onChange={(v) => setEducation('qualification', v)}
              placeholder={t('edit_profile.placeholders.qualification')}
            />
            <FormInput
              label={t('edit_profile.fields.field_of_study')}
              value={profile.education.field}
              onChange={(v) => setEducation('field', v)}
              placeholder={t('edit_profile.placeholders.field_of_study')}
            />
            <FormInput
              label={t('edit_profile.fields.university')}
              value={profile.education.university}
              onChange={(v) => setEducation('university', v)}
              placeholder={t('edit_profile.placeholders.university')}
            />

            <SelectPill
              label={t('edit_profile.fields.occupation_type')}
              options={OCCUPATION_TYPE_OPTIONS}
              value={profile.education.occupationType}
              onChange={(v) => setEducation('occupationType', v)}
              i18nPrefix="options.occupation_type"
            />

            <FormInput
              label={t('edit_profile.fields.occupation')}
              value={profile.education.occupation}
              onChange={(v) => setEducation('occupation', v)}
              placeholder={t('edit_profile.placeholders.occupation')}
            />
            <FormInput
              label={t('edit_profile.fields.company_name')}
              value={profile.education.companyName}
              onChange={(v) => setEducation('companyName', v)}
              placeholder={t('edit_profile.placeholders.company_name')}
            />
            <FormInput
              label={t('edit_profile.fields.job_role')}
              value={profile.education.jobRole}
              onChange={(v) => setEducation('jobRole', v)}
              placeholder={t('edit_profile.placeholders.job_role')}
            />
            <FormInput
              label={t('edit_profile.fields.annual_income')}
              value={profile.education.annualIncomeAmount}
              onChange={(v) => setEducation('annualIncomeAmount', v)}
              keyboardType="numeric"
              placeholder={t('edit_profile.placeholders.annual_income')}
            />
          </SectionCard>

          {/* ── Family ─────────────────────────────────────────────────── */}
          <SectionCard
            title={t('edit_profile.sections.family')}
            icon="home"
            sectionKey="family"
            {...sectionProps}
          >
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.father_name')}
                  value={profile.family.fatherName}
                  onChange={(v) => setFamily('fatherName', v)}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.mother_name')}
                  value={profile.family.motherName}
                  onChange={(v) => setFamily('motherName', v)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.father_occupation')}
                  value={profile.family.fatherOccupation}
                  onChange={(v) => setFamily('fatherOccupation', v)}
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label={t('edit_profile.fields.mother_occupation')}
                  value={profile.family.motherOccupation}
                  onChange={(v) => setFamily('motherOccupation', v)}
                />
              </View>
            </View>

            <SelectPill
              label={t('edit_profile.fields.family_type')}
              options={FAMILY_TYPE_OPTIONS}
              value={profile.family.familyType}
              onChange={(v) => setFamily('familyType', v)}
              i18nPrefix="options.family_type"
            />
            <SelectPill
              label={t('edit_profile.fields.family_status')}
              options={FAMILY_STATUS_OPTIONS}
              value={profile.family.familyStatus}
              onChange={(v) => setFamily('familyStatus', v)}
              i18nPrefix="options.family_status"
            />
            <SelectPill
              label={t('edit_profile.fields.family_values')}
              options={FAMILY_VALUE_OPTIONS}
              value={profile.family.familyValues}
              onChange={(v) => setFamily('familyValues', v)}
              i18nPrefix="options.family_values"
            />

            <SiblingsEditor
              value={profile.family.siblings}
              onChange={(v) => setFamily('siblings', v)}
            />
          </SectionCard>

          {/* ── Lifestyle ──────────────────────────────────────────────── */}
          <SectionCard
            title={t('edit_profile.sections.lifestyle')}
            icon="coffee"
            sectionKey="personal"
            {...sectionProps}
          >
            <SelectPill
              label={t('edit_profile.fields.smoking')}
              options={SMOKING_OPTIONS}
              value={profile.personal.smoking}
              onChange={(v) => setPersonal('smoking', v)}
              i18nPrefix="options.smoking"
            />
            <SelectPill
              label={t('edit_profile.fields.drinking')}
              options={DRINKING_OPTIONS}
              value={profile.personal.drinking}
              onChange={(v) => setPersonal('drinking', v)}
              i18nPrefix="options.drinking"
            />
            <SelectPill
              label={t('edit_profile.fields.diet')}
              options={DIET_OPTIONS}
              value={profile.personal.diet}
              onChange={(v) => setPersonal('diet', v)}
              i18nPrefix="options.diet"
            />
            <TagInput
              label={t('edit_profile.fields.hobbies')}
              items={profile.personal.hobbies}
              setItems={(v) => setPersonal('hobbies', v)}
              placeholder={t('edit_profile.placeholders.hobbies')}
            />
            <TagInput
              label={t('edit_profile.fields.languages_known')}
              items={profile.personal.languages}
              setItems={(v) => setPersonal('languages', v)}
              placeholder={t('edit_profile.placeholders.languages_known')}
            />
          </SectionCard>

          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
