import type { TFunction } from 'i18next';
import type { BasicData, PreferencesData } from '@/core/types';

export const validateOnboardingBasic = (
  basic: BasicData,
  t: TFunction
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!basic.firstName.trim())
    errors.firstName = t('onboarding.errors.first_name_required');
  if (!basic.dateOfBirth)
    errors.dateOfBirth = t('onboarding.errors.date_of_birth_required');
  if (!basic.gender) errors.gender = t('onboarding.errors.gender_required');
  if (!basic.country) errors.country = t('onboarding.errors.country_required');
  if (!basic.state?.trim())
    errors.state = t('onboarding.errors.state_required');
  if (!basic.city?.trim()) errors.city = t('onboarding.errors.city_required');
  if (!basic.gradeLevel.trim())
    errors.gradeLevel = t('onboarding.errors.grade_required');
  if (!basic.qualification)
    errors.qualification = t('onboarding.errors.qualification_required');
  if (!basic.institutionName.trim())
    errors.institutionName = t('onboarding.errors.institution_required');
  if (!basic.primaryGoal.trim())
    errors.primaryGoal = t('onboarding.errors.goal_required');

  return errors;
};

export const validateOnboardingPreferences = (
  preferences: PreferencesData,
  t: TFunction
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!preferences.dailySessionMinutes?.min)
    errors.minAgeRange = t('onboarding.errors.session_min_required');
  if (!preferences.dailySessionMinutes?.max)
    errors.maxAgeRange = t('onboarding.errors.session_max_required');
  if (!preferences.subjects?.length)
    errors.subjects = t('onboarding.errors.subjects_required');
  if (!preferences.learningGoals?.length)
    errors.goals = t('onboarding.errors.goals_required');

  return errors;
};
