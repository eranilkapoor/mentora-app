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
import {
  PROFILE_FOR_OPTIONS,
  RELIGIONS,
  QUALIFICATIONS,
} from '@/core/constants';
import { useOnboardingProfileMutation } from '@/store/services/authApi';
import {
  DropdownPickerProps,
  ErrorTextProps,
  RegistrationStep,
  ProfileImage,
} from './Onboarding.types';
import { onboardingStyles } from './Onboarding.styles';
import { Gender, Genders, BasicData, PreferencesData } from '@/core/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: RegistrationStep[] = ['basic', 'preferences', 'photos'];

const STEP_ICONS: Record<RegistrationStep, string> = {
  basic: 'user',
  preferences: 'heart',
  photos: 'camera',
};

const MAX_PHOTOS = 6;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ErrorText({ field, errors }: ErrorTextProps): React.ReactElement | null {
  const styles = useThemedStyles(onboardingStyles);
  if (!errors[field]) return null;
  return <Text style={styles.error}>{errors[field]}</Text>;
}

function DropdownPicker({
  label,
  options,
  value,
  onChange,
  field,
  errors,
  onClearError,
  showDropdown,
  onSetShowDropdown,
}: DropdownPickerProps): React.ReactElement {
  const isOpen = showDropdown === field;
  const styles = useThemedStyles(onboardingStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.input,
          styles.dropdownTrigger,
          errors[field] ? styles.inputError : null,
        ]}
        onPress={() => onSetShowDropdown(isOpen ? null : field)}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.select_label', { label })}
        accessibilityState={{ expanded: isOpen }}
      >
        <Text
          style={value ? styles.dropdownValueText : styles.dropdownPlaceholder}
        >
          {value || t('onboarding.select_placeholder', { label })}
        </Text>
        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {options.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.dropdownItem,
                  value === item && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onChange(item);
                  onClearError(field);
                  onSetShowDropdown(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={item}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    value === item && styles.dropdownItemTextActive,
                  ]}
                >
                  {item}
                </Text>
                {value === item && (
                  <Feather name="check" size={14} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function StepIndicator({
  currentStep,
}: {
  currentStep: RegistrationStep;
}): React.ReactElement {
  const currentIndex = STEPS.indexOf(currentStep);
  const styles = useThemedStyles(onboardingStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.stepIndicatorContent}
      style={styles.stepIndicatorContainer}
    >
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <View key={step} style={styles.stepIndicatorItem}>
            <View
              style={[
                styles.stepDot,
                isCompleted && styles.stepDotCompleted,
                isActive && styles.stepDotActive,
              ]}
            >
              {isCompleted ? (
                <Feather name="check" size={12} color={theme.colors.white} />
              ) : (
                <Feather
                  name={STEP_ICONS[step]}
                  size={12}
                  color={isActive ? theme.colors.white : theme.colors.textMuted}
                />
              )}
            </View>
            <Text
              style={[
                styles.stepDotLabel,
                isActive && styles.stepDotLabelActive,
                isCompleted && styles.stepDotLabelCompleted,
              ]}
            >
              {t(`onboarding.steps.${step}`)}
            </Text>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  isCompleted && styles.stepConnectorCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen(): React.ReactElement {
  const dispatch = useAppDispatch();
  const styles = useThemedStyles(onboardingStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<RegistrationStep>('basic');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [photos, setPhotos] = useState<ProfileImage[]>([]);

  const [basic, setBasic] = useState<BasicData>({
    profileFor: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'male',
    religion: '',
    caste: '',
    country: '',
    state: '',
    city: '',
    motherTongue: '',
    maritalStatus: 'never_married',
    aboutMe: '',
    qualification: '',
    occupation: '',
    height: '',
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    partnerPreference: {
      ageRange: { min: 18, max: 32 },
      heightRange: { min: 155, max: 170 },
      maritalStatus: [],
      religion: [],
      caste: [],
      country: [],
      state: [],
      city: [],
      qualification: [],
      occupation: [],
      annualIncomeRange: { min: 100000, max: 1000000 },
      bodyType: [],
      complexion: [],
      smoking: [],
      drinking: [],
      diet: [],
      languagesKnown: [],
      aboutPartner: '',
    },
    hobbies: [],
    smoking: 'non_smoker',
    drinking: 'non_drinker',
    diet: 'vegetarian',
    music: [],
    movies: [],
    sports: [],
    languagesKnown: [],
  });

  const [onboardingProfile] = useOnboardingProfileMutation();

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const clearError = useCallback((field: string): void => {
    setErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // Stable style helper — memoised so it doesn't recreate arrays on every render
  const inputStyle = useCallback(
    (field: string) =>
      errors[field]
        ? [styles.input, styles.inputError]
        : [styles.input],
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
        uri: result.assets[0].uri,
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

    if (!basic.profileFor.trim()) e.profileFor = t('onboarding.errors.required');
    if (!basic.firstName.trim()) e.firstName = t('onboarding.errors.first_name_required');
    if (!basic.dob) e.dob = t('onboarding.errors.dob_required');
    if (!basic.gender) e.gender = t('onboarding.errors.gender_required');
    if (!basic.religion) e.religion = t('onboarding.errors.religion_required');
    if (!basic.height.trim()) e.height = t('onboarding.errors.height_required');
    if (!basic.qualification) e.qualification = t('onboarding.errors.qualification_required');
    if (!basic.occupation.trim()) e.occupation = t('onboarding.errors.occupation_required');

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [basic, t]);

  const validatePreferences = useCallback((): boolean => {
    const e: Record<string, string> = {};
    const pref = preferences.partnerPreference;

    if (!pref?.ageRange?.min) e.minAgeRange = t('onboarding.errors.min_age_required');
    if (!pref?.ageRange?.max) e.maxAgeRange = t('onboarding.errors.max_age_required');
    if (!pref?.country?.length) e.country = t('onboarding.errors.country_required');

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [preferences, t]);

  // ─── Navigation ───────────────────────────────────────────────────────────

  const handleNext = useCallback((): void => {
    const validators: Partial<Record<RegistrationStep, () => boolean>> = {
      basic: validateBasic,
      preferences: validatePreferences,
    };

    const validator = validators[currentStep];
    if (validator !== undefined && !validator()) return;

    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
      setErrors({});
      setShowDropdown(null);
    }
  }, [currentStep, validateBasic, validatePreferences]);

  const handlePrevious = useCallback((): void => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
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
          const response = await fetch(photo.uri);
          const blob = await response.blob();
          formData.append('images', new File([blob], filename, { type }));
        } else {
          // React Native FormData accepts this shape for multipart uploads
          (formData as FormData).append('images', {
            uri: photo.uri,
            name: filename,
            type,
          } as unknown as Blob);
        }

        if (photo.isPrimary) {
          primaryIndex = index;
        }
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

  // ─── Shared dropdown props ────────────────────────────────────────────────

  const dropdownProps = useMemo(
    () => ({
      errors,
      onClearError: clearError,
      showDropdown,
      onSetShowDropdown: setShowDropdown,
    }),
    [errors, clearError, showDropdown]
  );

  // ─── Step: Basic ──────────────────────────────────────────────────────────

  const renderBasic = useMemo(
    () => (
      <View>
        <Text style={styles.stepTitle}>{t('onboarding.basic.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.basic.subtitle')}</Text>

        <Text style={styles.label}>{t('onboarding.fields.profile_for')} *</Text>
        <DropdownPicker
          label={t('onboarding.fields.profile_for')}
          options={PROFILE_FOR_OPTIONS}
          value={basic.profileFor}
          onChange={(val) => {
            setBasic((b) => ({ ...b, profileFor: val }));
            clearError('profileFor');
          }}
          field="profileFor"
          {...dropdownProps}
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
          value={basic.lastName}
          onChangeText={(text) => setBasic((b) => ({ ...b, lastName: text }))}
          style={styles.input}
          accessibilityLabel={t('onboarding.fields.last_name')}
        />

        <Text style={styles.label}>{t('onboarding.fields.dob')} *</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.textMuted}
          value={basic.dob}
          onChangeText={(text) => {
            setBasic((b) => ({ ...b, dob: text }));
            clearError('dob');
          }}
          style={inputStyle('dob')}
          accessibilityLabel={t('onboarding.fields.dob')}
        />
        <ErrorText field="dob" errors={errors} />

        <Text style={styles.label}>{t('onboarding.fields.gender')} *</Text>
        <View style={styles.chipRow}>
          {(Object.values(Genders) as Gender[]).map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.chip,
                basic.gender === g && styles.chipActive,
                errors.gender ? styles.inputError : null,
              ]}
              onPress={() => {
                setBasic((b) => ({ ...b, gender: g }));
                clearError('gender');
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: basic.gender === g }}
              accessibilityLabel={g}
            >
              <Text
                style={[
                  styles.chipText,
                  basic.gender === g && styles.chipTextActive,
                ]}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <ErrorText field="gender" errors={errors} />

        <Text style={styles.label}>{t('onboarding.fields.religion')} *</Text>
        <DropdownPicker
          label={t('onboarding.fields.religion')}
          options={RELIGIONS}
          value={basic.religion}
          onChange={(val) => {
            setBasic((b) => ({ ...b, religion: val }));
            clearError('religion');
          }}
          field="religion"
          {...dropdownProps}
        />
        <ErrorText field="religion" errors={errors} />

        <Text style={styles.label}>{t('onboarding.fields.country')}</Text>
        <TextInput
          placeholder={t('onboarding.placeholders.country')}
          placeholderTextColor={theme.colors.textMuted}
          value={basic.country}
          onChangeText={(text) => setBasic((b) => ({ ...b, country: text }))}
          style={styles.input}
          accessibilityLabel={t('onboarding.fields.country')}
        />

        <Text style={styles.label}>{t('onboarding.fields.state')}</Text>
        <TextInput
          placeholder={t('onboarding.placeholders.state')}
          placeholderTextColor={theme.colors.textMuted}
          value={basic.state}
          onChangeText={(text) => setBasic((b) => ({ ...b, state: text }))}
          style={styles.input}
          accessibilityLabel={t('onboarding.fields.state')}
        />

        <Text style={styles.label}>{t('onboarding.fields.city')}</Text>
        <TextInput
          placeholder={t('onboarding.placeholders.city')}
          placeholderTextColor={theme.colors.textMuted}
          value={basic.city}
          onChangeText={(text) => setBasic((b) => ({ ...b, city: text }))}
          style={styles.input}
          accessibilityLabel={t('onboarding.fields.city')}
        />

        <Text style={styles.label}>{t('onboarding.fields.qualification')} *</Text>
        <DropdownPicker
          label={t('onboarding.fields.qualification')}
          options={QUALIFICATIONS}
          value={basic.qualification}
          onChange={(val) => {
            setBasic((b) => ({ ...b, qualification: val }));
            clearError('qualification');
          }}
          field="qualification"
          {...dropdownProps}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [basic, errors, dropdownProps, styles, theme, t, inputStyle, clearError]
  );

  // ─── Step: Preferences ────────────────────────────────────────────────────

  const renderPreferences = useMemo(
    () => (
      <View>
        <Text style={styles.stepTitle}>{t('onboarding.preferences.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.preferences.subtitle')}</Text>

        {/* Age Range */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>{t('onboarding.fields.min_age')} *</Text>
            <TextInput
              placeholder="18"
              placeholderTextColor={theme.colors.textMuted}
              value={String(preferences.partnerPreference?.ageRange?.min ?? 18)}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setPreferences((p) => ({
                  ...p,
                  partnerPreference: {
                    ...p.partnerPreference,
                    ageRange: {
                      max: p.partnerPreference?.ageRange?.max ?? 35,
                      min: isNaN(parsed) ? 18 : parsed,
                    },
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
              value={String(preferences.partnerPreference?.ageRange?.max ?? 35)}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setPreferences((p) => ({
                  ...p,
                  partnerPreference: {
                    ...p.partnerPreference,
                    ageRange: {
                      min: p.partnerPreference?.ageRange?.min ?? 18,
                      max: isNaN(parsed) ? 35 : parsed,
                    },
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

        {/* Height Range */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>{t('onboarding.fields.min_height')}</Text>
            <TextInput
              placeholder="150"
              placeholderTextColor={theme.colors.textMuted}
              value={String(preferences.partnerPreference?.heightRange?.min ?? '')}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setPreferences((p) => ({
                  ...p,
                  partnerPreference: {
                    ...p.partnerPreference,
                    heightRange: {
                      max: p.partnerPreference?.heightRange?.max ?? 0,
                      min: isNaN(parsed) ? 0 : parsed,
                    },
                  },
                }));
              }}
              style={styles.input}
              keyboardType="numeric"
              accessibilityLabel={t('onboarding.fields.min_height')}
            />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>{t('onboarding.fields.max_height')}</Text>
            <TextInput
              placeholder="180"
              placeholderTextColor={theme.colors.textMuted}
              value={String(preferences.partnerPreference?.heightRange?.max ?? '')}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setPreferences((p) => ({
                  ...p,
                  partnerPreference: {
                    ...p.partnerPreference,
                    heightRange: {
                      min: p.partnerPreference?.heightRange?.min ?? 0,
                      max: isNaN(parsed) ? 0 : parsed,
                    },
                  },
                }));
              }}
              style={styles.input}
              keyboardType="numeric"
              accessibilityLabel={t('onboarding.fields.max_height')}
            />
          </View>
        </View>

        <Text style={styles.label}>{t('onboarding.fields.religion_preference')}</Text>
        <TextInput
          placeholder={t('onboarding.placeholders.religion_preference')}
          placeholderTextColor={theme.colors.textMuted}
          value={preferences.partnerPreference?.religion?.join(', ') ?? ''}
          onChangeText={(text) =>
            setPreferences((p) => ({
              ...p,
              partnerPreference: {
                ...p.partnerPreference,
                religion: text
                  .split(',')
                  .map((r) => r.trim())
                  .filter(Boolean),
              },
            }))
          }
          style={styles.input}
          accessibilityLabel={t('onboarding.fields.religion_preference')}
        />

        <Text style={styles.label}>{t('onboarding.fields.location_preference')} *</Text>
        <TextInput
          placeholder={t('onboarding.placeholders.location_preference')}
          placeholderTextColor={theme.colors.textMuted}
          value={preferences.partnerPreference?.country?.join(', ') ?? ''}
          onChangeText={(text) => {
            setPreferences((p) => ({
              ...p,
              partnerPreference: {
                ...p.partnerPreference,
                country: text
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean),
              },
            }));
            clearError('country');
          }}
          style={inputStyle('country')}
          accessibilityLabel={t('onboarding.fields.location_preference')}
        />
        <ErrorText field="country" errors={errors} />
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <View key={`${img.uri}-${index}`} style={styles.photoWrapper}>
              <Image source={{ uri: img.uri }} style={styles.photo} />

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
                  <Feather name="trash-2" size={12} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add button — only rendered when under limit, not empty string */}
          {photos.length < MAX_PHOTOS && (
            <TouchableOpacity
              style={styles.addPhotoBtn}
              onPress={() => { void pickImage(); }}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.photos.add')}
            >
              <Feather name="plus" size={28} color={theme.colors.textMuted} />
              <Text style={styles.addPhotoText}>{t('onboarding.photos.add')}</Text>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photos, styles, theme, t, pickImage, setPrimaryPhoto, removePhoto]
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  const stepContent: Record<RegistrationStep, React.ReactElement> = useMemo(
    () => ({
      basic: renderBasic as React.ReactElement,
      preferences: renderPreferences as React.ReactElement,
      photos: renderPhotos as React.ReactElement,
    }),
    [renderBasic, renderPreferences, renderPhotos]
  );

  const progressPercent =
    ((STEPS.indexOf(currentStep) + 1) / STEPS.length) * 100;

  const isFirstStep = currentStep === STEPS[0];
  const isLastStep = currentStep === STEPS[STEPS.length - 1];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.container}
      >
        {/* Progress Bar */}
        <View style={styles.progressBarWrapper}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {stepContent[currentStep]}

          {/* Navigation Buttons */}
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
              style={[
                styles.primaryButton,
                loading && styles.disabledButton,
              ]}
              onPress={isLastStep ? () => { void handleSubmit(); } : handleNext}
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
    </SafeAreaView>
  );
}