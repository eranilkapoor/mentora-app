import type { TFunction } from 'i18next';
import type { BasicData, PreferencesData } from '@/core/types';

export const validateOnboardingBasic = (
  basic: BasicData,
  t: TFunction
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!basic.profileFor.trim())
    errors.profileFor = t('onboarding.errors.required');
  if (!basic.firstName.trim())
    errors.firstName = t('onboarding.errors.first_name_required');
  if (!basic.dateOfBirth)
    errors.dateOfBirth = t('onboarding.errors.date_of_birth_required');
  if (!basic.gender) errors.gender = t('onboarding.errors.gender_required');
  if (!basic.maritalStatus)
    errors.maritalStatus = t('onboarding.errors.marital_status_required');
  if (!basic.religion)
    errors.religion = t('onboarding.errors.religion_required');
  if (!basic.country) errors.country = t('onboarding.errors.country_required');
  if (!basic.height.trim())
    errors.height = t('onboarding.errors.height_required');
  else if (!/^\d+$/.test(basic.height.trim()))
    errors.height = t('onboarding.errors.height_invalid');
  if (!basic.qualification)
    errors.qualification = t('onboarding.errors.qualification_required');
  if (!basic.occupation.trim())
    errors.occupation = t('onboarding.errors.occupation_required');

  return errors;
};

export const validateOnboardingPreferences = (
  preferences: PreferencesData,
  t: TFunction
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!preferences.ageRange?.min)
    errors.minAgeRange = t('onboarding.errors.min_age_required');
  if (!preferences.ageRange?.max)
    errors.maxAgeRange = t('onboarding.errors.max_age_required');
  if (!preferences.maritalStatus?.length)
    errors.maritalStatusPreference = t(
      'onboarding.errors.marital_status_preference_required'
    );
  if (!preferences.religion?.length)
    errors.religionPreference = t(
      'onboarding.errors.religion_preference_required'
    );
  if (!preferences.country?.length)
    errors.locationPreference = t(
      'onboarding.errors.location_preference_required'
    );

  return errors;
};
