import { useCallback, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setProfileCompleted } from '@/store/slices/authSlice';
import { MAX_PHOTOS } from '@/core/constants';
import * as ImagePicker from 'expo-image-picker';
import {
  BasicData,
  PreferencesData,
  ProfileImage,
  ProfileFors,
  Genders,
  Religions,
  Countries,
  MaritalStatuses,
  Qualifications,
} from '@/core/types';
import { useOnboardingProfileMutation } from '@/store/services/profileApi';

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_BASIC: BasicData = {
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
};

const INITIAL_PREFERENCES: PreferencesData = {
  ageRange: { min: 18, max: 32 },
  heightRange: { min: 155, max: 170 },
  maritalStatus: [],
  religion: [],
  country: [],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOnboardingForm() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [onboardingProfile] = useOnboardingProfileMutation();

  const [basic, setBasic] = useState<BasicData>(INITIAL_BASIC);
  const [preferences, setPreferences] =
    useState<PreferencesData>(INITIAL_PREFERENCES);
  const [photos, setPhotos] = useState<ProfileImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // ─── Error helpers ──────────────────────────────────────────────────────

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => setErrors({}), []);

  // ─── Basic setters ───────────────────────────────────────────────────────

  const setBasicField = useCallback(
    <K extends keyof BasicData>(key: K, value: BasicData[K]) => {
      setBasic((prev) => ({ ...prev, [key]: value }));
      clearError(key);
    },
    [clearError]
  );

  // ─── Preference setters ──────────────────────────────────────────────────

  const setPreferenceField = useCallback(
    <K extends keyof PreferencesData>(key: K, value: PreferencesData[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // ─── Photo handlers ──────────────────────────────────────────────────────

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

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [
        ...prev,
        { url: result.assets[0].uri, isPrimary: prev.length === 0 },
      ]);
    }
  }, [photos.length, t]);

  const setPrimaryPhoto = useCallback((index: number) => {
    setPhotos((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  }, []);

  // ─── Validators ──────────────────────────────────────────────────────────

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

  // ─── Submit ──────────────────────────────────────────────────────────────

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
          const res = await fetch(photo.url);
          const blob = await res.blob();
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
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.something_went_wrong')
      );
    } finally {
      setLoading(false);
    }
  }, [basic, preferences, photos, dispatch, onboardingProfile, t]);

  return {
    // State
    basic,
    preferences,
    photos,
    errors,
    loading,
    // Setters
    setBasicField,
    setPreferenceField,
    // Photo handlers
    pickImage,
    setPrimaryPhoto,
    removePhoto,
    // Validators
    validateBasic,
    validatePreferences,
    // Submit
    handleSubmit,
    // Error helpers
    clearError,
    clearAllErrors,
  };
}
