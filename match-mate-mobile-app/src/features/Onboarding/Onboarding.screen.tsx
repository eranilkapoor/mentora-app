import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setProfileCompleted } from '@/store/slices/authSlice';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { MAX_PHOTOS } from '@/core/constants';
import { ONBOARDING_STEPS, OnboardingSteps } from './Onboarding.types';
import { onboardingStyles } from './Onboarding.styles';
import {
  Gender,
  Genders,
  BasicData,
  PreferencesData,
  MaritalStatus,
  ReligionOptions,
  MaritalStatusOptions,
  ProfileForOptions,
  QualificationOptions,
  CountryOptions,
  DayOptions,
  MonthOptions,
  YearOptions,
  Religion,
  Country,
  Qualification,
  ProfileFor,
  ProfileFors,
  Religions,
  Countries,
  MaritalStatuses,
  Qualifications,
  ProfileImage,
  GenderOptions,
} from '@/core/types';
import { ErrorText } from './components/ErrorText';
import { StepIndicator } from './components/StepIndicator';
import { useOnboardingProfileMutation } from '@/store/services/profileApi';
import { SelectPill } from '@/core/components/SelectPill';
import { SearchMultiSelect } from '@/core/components/SearchMultiSelect';
import { DropdownPicker } from '@/core/components/DropdownPicker';

export default function OnboardingScreen(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useThemedStyles(onboardingStyles);

  const [currentStep, setCurrentStep] = useState<OnboardingSteps>('basic');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showDatePickerDropdown, setShowDatePickerDropdown] = useState<
    string | null
  >(null);

  const [photos, setPhotos] = useState<ProfileImage[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({ day: '', month: '', year: '' });

  const [basic, setBasic] = useState<BasicData>({
    profileFor: ProfileFors.SELF,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: Genders.MALE,
    religion: Religions.HINDU,
    country: Countries.INDIA,
    maritalStatus: MaritalStatuses.NEVER_MARRIED,
    qualification: Qualifications.BTECH,
    occupation: '',
    height: '',
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    ageRange: { min: 18, max: 32 },
    heightRange: { min: 155, max: 170 },
    maritalStatus: [],
    religion: [],
    country: [],
  });

  const [onboardingProfile] = useOnboardingProfileMutation();

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const formatDate = useCallback((d: string, m: string, y: string): string => {
    if (!d || !m || !y) return '';
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }, []);

  const clearError = useCallback((field: string): void => {
    setErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const openDatePicker = useCallback(() => {
    if (basic.dateOfBirth) {
      const [y, m, d] = basic.dateOfBirth.split('-');
      setTempDate({ day: d ?? '', month: m ?? '', year: y ?? '' });
    }
    setShowDropdown(null);
    setShowDatePicker(true);
  }, [basic.dateOfBirth]);

  const confirmDate = useCallback(() => {
    const { day, month, year } = tempDate;

    if (!day || !month || !year) {
      Alert.alert(t('common.error'), t('onboarding.errors.date_incomplete'));
      return;
    }

    const formatted = formatDate(day, month, year);
    setBasic((b) => ({ ...b, dateOfBirth: formatted }));
    clearError('dateOfBirth');
    setShowDatePicker(false);
    setShowDatePickerDropdown(null);
  }, [tempDate, formatDate, clearError, t]);

  const cancelDatePicker = useCallback(() => {
    setShowDatePicker(false);
    setShowDatePickerDropdown(null);
    if (basic.dateOfBirth) {
      const [y, m, d] = basic.dateOfBirth.split('-');
      setTempDate({ day: d ?? '', month: m ?? '', year: y ?? '' });
    } else {
      setTempDate({ day: '', month: '', year: '' });
    }
  }, [basic.dateOfBirth]);

  const inputStyle = useCallback(
    (field: string) =>
      errors[field] ? [styles.input, styles.inputError] : [styles.input],
    [errors, styles]
  );

  // ─── Photo Handlers ───────────────────────────────────────────────────────

  const pickImage = useCallback(async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('onboarding.photos.permission_title'),
        t('onboarding.photos.permission_message')
      );
      return;
    }

    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(
        t('onboarding.photos.limit_title'),
        t('onboarding.photos.limit_message', { max: MAX_PHOTOS })
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 5] as [number, number],
    });

    if (!result.canceled && result.assets[0] !== undefined) {
      const newImage: ProfileImage = {
        url: result.assets[0].uri,
        isPrimary: photos.length === 0,
      };
      setPhotos((prev) => [...prev, newImage]);
    }
  }, [photos.length, t]);

  const setPrimaryPhoto = useCallback((index: number): void => {
    setPhotos((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  }, []);

  const removePhoto = useCallback((index: number): void => {
    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0] = { ...updated[0], isPrimary: true };
      }
      return updated;
    });
  }, []);

  // ─── Validators ───────────────────────────────────────────────────────────

  const validateBasic = useCallback((): boolean => {
    const e: Record<string, string> = {};

    if (!basic.profileFor.trim())
      e.profileFor = t('onboarding.errors.required');
    if (!basic.firstName.trim())
      e.firstName = t('onboarding.errors.first_name_required');
    if (!basic.dateOfBirth)
      e.dateOfBirth = t('onboarding.errors.date_of_birth_required');
    if (!basic.gender) e.gender = t('onboarding.errors.gender_required');
    if (!basic.maritalStatus)
      e.maritalStatus = t('onboarding.errors.marital_status_required');
    if (!basic.religion) e.religion = t('onboarding.errors.religion_required');
    if (!basic.country) e.country = t('onboarding.errors.country_required');
    if (!basic.height.trim()) e.height = t('onboarding.errors.height_required');
    if (!basic.qualification)
      e.qualification = t('onboarding.errors.qualification_required');
    if (!basic.occupation.trim())
      e.occupation = t('onboarding.errors.occupation_required');

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [basic, t]);

  const validatePreferences = useCallback((): boolean => {
    const e: Record<string, string> = {};

    if (!preferences.ageRange?.min)
      e.minAgeRange = t('onboarding.errors.min_age_required');
    if (!preferences.ageRange?.max)
      e.maxAgeRange = t('onboarding.errors.max_age_required');
    if (!preferences.maritalStatus?.length)
      e.maritalStatusPreference = t(
        'onboarding.errors.marital_status_preference_required'
      );
    if (!preferences.religion?.length)
      e.religionPreference = t(
        'onboarding.errors.religion_preference_required'
      );
    if (!preferences.country?.length)
      e.locationPreference = t(
        'onboarding.errors.location_preference_required'
      );

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [preferences, t]);

  // ─── Navigation ───────────────────────────────────────────────────────────

  const handleNext = useCallback((): void => {
    const validators: Partial<Record<OnboardingSteps, () => boolean>> = {
      basic: validateBasic,
      preferences: validatePreferences,
    };

    const validator = validators[currentStep];
    if (validator !== undefined && !validator()) return;

    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex + 1]);
      setErrors({});
      setShowDropdown(null);
    }
  }, [currentStep, validateBasic, validatePreferences]);

  const handlePrevious = useCallback((): void => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex - 1]);
      setErrors({});
      setShowDropdown(null);
    }
  }, [currentStep]);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('basic', JSON.stringify(basic));
      formData.append('preferences', JSON.stringify(preferences));

      let primaryIndex = 0;

      for (const [index, photo] of photos.entries()) {
        const filename = `photo_${index}.jpg`;
        const type = 'image/jpeg';

        if (Platform.OS === 'web') {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          formData.append(
            'profileImages',
            new File([blob], filename, { type })
          );
        } else {
          (formData as FormData).append('profileImages', {
            uri: photo.url,
            name: filename,
            type,
          } as unknown as Blob);
        }

        if (photo.isPrimary) primaryIndex = index;
      }

      formData.append('primaryImageIndex', String(primaryIndex));

      const response = await onboardingProfile(formData).unwrap();

      if (!response.success) {
        Alert.alert(t('common.error'), t('onboarding.errors.submit_failed'));
        return;
      }

      dispatch(setProfileCompleted(true));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('common.something_went_wrong');
      Alert.alert(t('common.error'), message);
    } finally {
      setLoading(false);
    }
  }, [basic, preferences, photos, dispatch, onboardingProfile, t]);

  // ─── Step: Basic ──────────────────────────────────────────────────────────
  const renderBasic = useMemo(
    () => (
      <View>
        <Text style={styles.stepTitle}>{t('onboarding.basic.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.basic.subtitle')}</Text>

        <DropdownPicker
          label={t('onboarding.fields.profile_for')}
          options={ProfileForOptions}
          value={basic.profileFor}
          onChange={(val) => {
            setBasic((b) => ({ ...b, profileFor: val as ProfileFor }));
            clearError('profileFor');
          }}
          required={true}
        />
        <ErrorText field="profileFor" errors={errors} />

        <Text style={styles.label}>{t('onboarding.fields.first_name')} *</Text>
        <TextInput
          placeholder={t('onboarding.placeholders.first_name')}
          placeholderTextColor={theme.colors.textMuted}
          value={basic.firstName}
          onChangeText={(text) => {
            setBasic((b) => ({ ...b, firstName: text }));
            clearError('firstName');
          }}
          style={inputStyle('firstName')}
          accessibilityLabel={t('onboarding.fields.first_name')}
        />
        <ErrorText field="firstName" errors={errors} />

        <Text style={styles.label}>{t('onboarding.fields.last_name')}</Text>
        <TextInput
          placeholder={t('onboarding.placeholders.last_name')}
          placeholderTextColor={theme.colors.textMuted}
          value={basic.lastName ?? ''}
          onChangeText={(text) => setBasic((b) => ({ ...b, lastName: text }))}
          style={styles.input}
          accessibilityLabel={t('onboarding.fields.last_name')}
        />

        <SelectPill
          label={t('onboarding.fields.gender')}
          options={GenderOptions}
          value={basic.gender}
          onChange={(v) => {
            setBasic((b) => ({ ...b, gender: v as Gender }));
          }}
          i18nPrefix="options.gender"
        />

        <Text style={styles.label}>
          {t('onboarding.fields.date_of_birth')} *
        </Text>
        <TouchableOpacity
          onPress={openDatePicker}
          style={inputStyle('dateOfBirth')}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.fields.date_of_birth')}
        >
          <Text
            style={
              basic.dateOfBirth
                ? styles.dropdownValueText
                : styles.dropdownPlaceholder
            }
          >
            {basic.dateOfBirth || t('onboarding.placeholders.select_date')}
          </Text>
        </TouchableOpacity>
        <ErrorText field="dateOfBirth" errors={errors} />

        <SelectPill
          label={t('onboarding.fields.marital_status')}
          options={MaritalStatusOptions}
          value={basic.maritalStatus}
          onChange={(v) => {
            setBasic((b) => ({ ...b, maritalStatus: v as MaritalStatus }));
          }}
          i18nPrefix="options.marital"
        />

        <DropdownPicker
          label={t('onboarding.fields.religion')}
          options={ReligionOptions}
          value={basic.religion}
          onChange={(val) => {
            setBasic((b) => ({ ...b, religion: val as Religion }));
            clearError('religion');
          }}
          required={true}
        />
        <ErrorText field="religion" errors={errors} />

        <DropdownPicker
          label={t('onboarding.fields.country')}
          options={CountryOptions}
          value={basic.country}
          onChange={(val) => {
            setBasic((b) => ({ ...b, country: val as Country }));
            clearError('country');
          }}
          required={true}
        />
        <ErrorText field="country" errors={errors} />

        <DropdownPicker
          label={t('onboarding.fields.qualification')}
          options={QualificationOptions}
          value={basic.qualification}
          onChange={(val) => {
            setBasic((b) => ({ ...b, qualification: val as Qualification }));
            clearError('qualification');
          }}
          required={true}
        />
        <ErrorText field="qualification" errors={errors} />

        <Text style={styles.label}>{t('onboarding.fields.occupation')} *</Text>
        <TextInput
          placeholder={t('onboarding.placeholders.occupation')}
          placeholderTextColor={theme.colors.textMuted}
          value={basic.occupation}
          onChangeText={(text) => {
            setBasic((b) => ({ ...b, occupation: text }));
            clearError('occupation');
          }}
          style={inputStyle('occupation')}
          accessibilityLabel={t('onboarding.fields.occupation')}
        />
        <ErrorText field="occupation" errors={errors} />

        <Text style={styles.label}>{t('onboarding.fields.height')} *</Text>
        <TextInput
          placeholder={t('onboarding.placeholders.height')}
          placeholderTextColor={theme.colors.textMuted}
          value={basic.height}
          onChangeText={(text) => {
            setBasic((b) => ({ ...b, height: text }));
            clearError('height');
          }}
          style={inputStyle('height')}
          keyboardType="numeric"
          accessibilityLabel={t('onboarding.fields.height')}
        />
        <ErrorText field="height" errors={errors} />
      </View>
    ),
    [basic, errors, styles, theme, t, inputStyle, clearError, openDatePicker]
  );

  // ─── Step: Preferences ────────────────────────────────────────────────────

  const renderPreferences = useMemo(
    () => (
      <View>
        <Text style={styles.stepTitle}>
          {t('onboarding.preferences.title')}
        </Text>
        <Text style={styles.subtitle}>
          {t('onboarding.preferences.subtitle')}
        </Text>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>{t('onboarding.fields.min_age')} *</Text>
            <TextInput
              placeholder="18"
              placeholderTextColor={theme.colors.textMuted}
              value={String(preferences.ageRange?.min ?? 0)}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setPreferences((p) => ({
                  ...p,
                  ageRange: {
                    max: p.ageRange?.max ?? 35,
                    min: isNaN(parsed) ? 0 : parsed,
                  },
                }));
                clearError('minAgeRange');
              }}
              style={inputStyle('minAgeRange')}
              keyboardType="numeric"
              accessibilityLabel={t('onboarding.fields.min_age')}
            />
            <ErrorText field="minAgeRange" errors={errors} />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>{t('onboarding.fields.max_age')} *</Text>
            <TextInput
              placeholder="35"
              placeholderTextColor={theme.colors.textMuted}
              value={String(preferences.ageRange?.max ?? 0)}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setPreferences((p) => ({
                  ...p,
                  ageRange: {
                    min: p.ageRange?.min ?? 18,
                    max: isNaN(parsed) ? 0 : parsed,
                  },
                }));
                clearError('maxAgeRange');
              }}
              style={inputStyle('maxAgeRange')}
              keyboardType="numeric"
              accessibilityLabel={t('onboarding.fields.max_age')}
            />
            <ErrorText field="maxAgeRange" errors={errors} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>
              {t('onboarding.fields.min_height')}
            </Text>
            <TextInput
              placeholder="150"
              placeholderTextColor={theme.colors.textMuted}
              value={String(preferences.heightRange?.min ?? 0)}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setPreferences((p) => ({
                  ...p,
                  heightRange: {
                    max: p.heightRange?.max ?? 0,
                    min: isNaN(parsed) ? 0 : parsed,
                  },
                }));
              }}
              style={styles.input}
              keyboardType="numeric"
              accessibilityLabel={t('onboarding.fields.min_height')}
            />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>
              {t('onboarding.fields.max_height')}
            </Text>
            <TextInput
              placeholder="180"
              placeholderTextColor={theme.colors.textMuted}
              value={String(preferences.heightRange?.max ?? 0)}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setPreferences((p) => ({
                  ...p,
                  heightRange: {
                    min: p.heightRange?.min ?? 0,
                    max: isNaN(parsed) ? 0 : parsed,
                  },
                }));
              }}
              style={styles.input}
              keyboardType="numeric"
              accessibilityLabel={t('onboarding.fields.max_height')}
            />
          </View>
        </View>

        <SearchMultiSelect
          label={t('onboarding.fields.marital_status_preference')}
          options={MaritalStatusOptions}
          selected={preferences.maritalStatus ?? []}
          onChange={(values) => {
            setPreferences((p) => ({
              ...p,
              maritalStatus: values as MaritalStatus[],
            }));
            clearError('maritalStatusPreference');
          }}
          placeholder={t('onboarding.placeholders.marital_status_preference')}
          field="maritalStatusPreference"
          errors={errors}
        />

        <SearchMultiSelect
          label={t('onboarding.fields.religion_preference')}
          options={ReligionOptions}
          selected={preferences.religion ?? []}
          onChange={(values) => {
            setPreferences((p) => ({
              ...p,
              religion: values as Religion[],
            }));
            clearError('religionPreference');
          }}
          placeholder={t('onboarding.placeholders.religion_preference')}
          field="religionPreference"
          errors={errors}
        />

        <SearchMultiSelect
          label={t('onboarding.fields.location_preference')}
          options={CountryOptions}
          selected={preferences.country ?? []}
          onChange={(values) => {
            setPreferences((p) => ({
              ...p,
              country: values as Country[],
            }));
            clearError('locationPreference');
          }}
          placeholder={t('onboarding.placeholders.location_preference')}
          field="locationPreference"
          errors={errors}
        />
      </View>
    ),
    [preferences, errors, styles, theme, t, inputStyle, clearError]
  );

  // ─── Step: Photos ─────────────────────────────────────────────────────────

  const renderPhotos = useMemo(
    () => (
      <View>
        <Text style={styles.stepTitle}>{t('onboarding.photos.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.photos.subtitle')}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoRow}
          keyboardShouldPersistTaps="handled"
        >
          {photos.map((img, index) => (
            <View key={`${img.url}-${index}`} style={styles.photoWrapper}>
              <Image source={{ uri: img.url }} style={styles.photo} />
              {img.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>
                    {t('onboarding.photos.primary')}
                  </Text>
                </View>
              )}
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.photoActionBtn}
                  onPress={() => setPrimaryPhoto(index)}
                  accessibilityRole="button"
                  accessibilityLabel={t('onboarding.photos.set_primary')}
                >
                  <Feather name="star" size={12} color={theme.colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, styles.photoActionBtnDanger]}
                  onPress={() => removePhoto(index)}
                  accessibilityRole="button"
                  accessibilityLabel={t('onboarding.photos.remove')}
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

          {photos.length < MAX_PHOTOS && (
            <TouchableOpacity
              style={styles.addPhotoBtn}
              onPress={() => {
                void pickImage();
              }}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.photos.add')}
            >
              <Feather name="plus" size={28} color={theme.colors.textMuted} />
              <Text style={styles.addPhotoText}>
                {t('onboarding.photos.add')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <Text style={styles.photoHint}>{t('onboarding.photos.hint')}</Text>

        {photos.length === 0 && (
          <View style={styles.photoEmptyState}>
            <Feather name="camera" size={40} color={theme.colors.textMuted} />
            <Text style={styles.photoEmptyTitle}>
              {t('onboarding.photos.empty_title')}
            </Text>
            <Text style={styles.photoEmptySubtitle}>
              {t('onboarding.photos.empty_subtitle')}
            </Text>
          </View>
        )}
      </View>
    ),
    [photos, styles, theme, t, pickImage, setPrimaryPhoto, removePhoto]
  );

  // ─── Step content map ─────────────────────────────────────────────────────

  const stepContent = useMemo<Record<OnboardingSteps, React.ReactElement>>(
    () => ({
      basic: renderBasic as React.ReactElement,
      preferences: renderPreferences as React.ReactElement,
      photos: renderPhotos as React.ReactElement,
    }),
    [renderBasic, renderPreferences, renderPhotos]
  );

  const progressPercent =
    ((ONBOARDING_STEPS.indexOf(currentStep) + 1) / ONBOARDING_STEPS.length) *
    100;

  const isFirstStep = currentStep === ONBOARDING_STEPS[0];
  const isLastStep =
    currentStep === ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.container}
      >
        <View style={styles.progressBarWrapper}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>

        <StepIndicator currentStep={currentStep} />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {stepContent[currentStep]}

          <View style={styles.buttonContainer}>
            {!isFirstStep && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePrevious}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.nav.previous')}
              >
                <Feather
                  name="arrow-left"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.secondaryButtonText}>
                  {t('onboarding.nav.previous')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={
                isLastStep
                  ? () => {
                      void handleSubmit();
                    }
                  : handleNext
              }
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={
                isLastStep
                  ? t('onboarding.nav.submit')
                  : t('onboarding.nav.next')
              }
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {isLastStep
                      ? t('onboarding.nav.submit')
                      : t('onboarding.nav.next')}
                  </Text>
                  <Feather
                    name={isLastStep ? 'check' : 'arrow-right'}
                    size={16}
                    color={theme.colors.white}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Overlay — outside KeyboardAvoidingView so it covers full screen */}
      {showDatePicker && (
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <Text style={styles.stepTitle}>
              {t('onboarding.date_picker.title')}
            </Text>

            <DropdownPicker
              label={t('onboarding.date_picker.day')}
              options={DayOptions}
              value={tempDate.day}
              onChange={(val) => setTempDate((p) => ({ ...p, day: val }))}
              required={true}
            />

            <DropdownPicker
              label={t('onboarding.date_picker.month')}
              options={MonthOptions}
              value={tempDate.month}
              onChange={(val) => setTempDate((p) => ({ ...p, month: val }))}
              required={true}
            />

            <DropdownPicker
              label={t('onboarding.date_picker.year')}
              options={YearOptions}
              value={tempDate.year}
              onChange={(val) => setTempDate((p) => ({ ...p, year: val }))}
              required={true}
            />

            <View style={styles.datePickerActions}>
              <TouchableOpacity
                onPress={cancelDatePicker}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
              >
                <Text style={styles.datePickerCancelText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDate}
                accessibilityRole="button"
                accessibilityLabel={t('common.confirm')}
              >
                <Text style={styles.datePickerConfirmText}>
                  {t('common.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
