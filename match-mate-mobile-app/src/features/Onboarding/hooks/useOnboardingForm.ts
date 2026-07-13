import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setOnboardingCompletionPending } from '@/store/slices/auth.slice';
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
import { useOnboardingProfileMutation } from '@/store/services/profileApi.service';
import { baseApi } from '@/store/services/baseApi.service';
import { showError } from '@/core/utils/toast';
import { hasMediaLibraryPermission } from '@/core/utils/mediaPermission';
import {
  getApiErrorMessage,
  getApiResponseMessage,
} from '@/core/utils/apiMessage';
import {
  validateOnboardingBasic,
  validateOnboardingPreferences,
} from './onboardingForm.utils';

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
  caste: [],
  subCaste: [],
  manglikStatus: [],
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
    if (!hasMediaLibraryPermission(status)) {
      showError({
        title: t('onboarding.photos.permission_title'),
        message: t('onboarding.photos.permission_message'),
      });
      return;
    }

    if (photos.length >= MAX_PHOTOS) {
      showError({
        title: t('onboarding.photos.limit_title'),
        message: t('onboarding.photos.limit_message', { max: MAX_PHOTOS }),
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 5] as [number, number],
    });

    const asset = result.assets?.[0];

    if (!result.canceled && asset?.uri) {
      setPhotos((prev) => [
        ...prev,
        { url: asset.uri, isPrimary: prev.length === 0 },
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
        const firstPhoto = next[0];
        if (firstPhoto) {
          next[0] = { ...firstPhoto, isPrimary: true };
        }
      }
      return next;
    });
  }, []);

  // ─── Validators ──────────────────────────────────────────────────────────

  const validateBasic = useCallback((): boolean => {
    const e = validateOnboardingBasic(basic, t);

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [basic, t]);

  const validatePreferences = useCallback((): boolean => {
    const e = validateOnboardingPreferences(preferences, t);

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [preferences, t]);

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (): Promise<boolean> => {
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
        showError({
          title: t('common.error'),
          message: getApiResponseMessage(
            t,
            response,
            'onboarding.errors.submit_failed'
          ),
        });
        return false;
      }

      const isOnboardingCompleted =
        response.data?.isOnboardingCompleted ?? true;

      dispatch(setOnboardingCompletionPending(isOnboardingCompleted));
      dispatch(baseApi.util.invalidateTags(['Profile', 'Preference']));
      return isOnboardingCompleted;
    } catch (err: unknown) {
      showError({
        title: t('common.error'),
        message: getApiErrorMessage(t, err, 'common.something_went_wrong'),
      });
      return false;
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
