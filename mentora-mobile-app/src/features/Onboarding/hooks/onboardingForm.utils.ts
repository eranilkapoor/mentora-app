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
  if (!basic.country) errors.country = t('onboarding.errors.country_required');
  if (!basic.state?.trim())
    errors.state = t('onboarding.errors.state_required');
  if (!basic.city?.trim()) errors.city = t('onboarding.errors.city_required');
  if (!basic.height.trim())
    errors.height = t('onboarding.errors.grade_required');
  else if (!/^\d+$/.test(basic.height.trim()))
    errors.height = t('onboarding.errors.grade_invalid');
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
    errors.minAgeRange = t('onboarding.errors.session_min_required');
  if (!preferences.ageRange?.max)
    errors.maxAgeRange = t('onboarding.errors.session_max_required');
  if (!preferences.city?.length)
    errors.subjects = t('onboarding.errors.subjects_required');
  if (!preferences.state?.length)
    errors.goals = t('onboarding.errors.goals_required');

  return errors;
};
