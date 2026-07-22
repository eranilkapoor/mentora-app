import { Countries, Genders, Qualifications, Religions } from '@/core/types';
import {
  validateOnboardingBasic,
  validateOnboardingPreferences,
} from './onboardingForm.utils';

const t = ((key: string) => key) as never;

describe('onboarding form validation', () => {
  it('reports every required basic field and accepts a complete profile', () => {
    const basic = {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: Genders.MALE,
      religion: Religions.HINDU,
      country: Countries.INDIA,
      state: '',
      city: '',
      qualification: Qualifications.BTECH,
      gradeLevel: '',
      institutionName: '',
      primaryGoal: '',
    };

    expect(validateOnboardingBasic(basic, t)).toEqual({
      firstName: 'onboarding.errors.first_name_required',
      dateOfBirth: 'onboarding.errors.date_of_birth_required',
      gradeLevel: 'onboarding.errors.grade_required',
      institutionName: 'onboarding.errors.institution_required',
      primaryGoal: 'onboarding.errors.goal_required',
      state: 'onboarding.errors.state_required',
      city: 'onboarding.errors.city_required',
    });
    expect(
      validateOnboardingBasic(
        {
          ...basic,
          firstName: 'Asha',
          dateOfBirth: '1995-04-12',
          gradeLevel: '8',
          institutionName: 'Delhi Public School',
          primaryGoal: 'Board exam preparation',
          state: 'Maharashtra',
          city: 'Mumbai',
        },
        t
      )
    ).toEqual({});

    expect(
      validateOnboardingBasic({ ...basic, firstName: 'Asha' }, t)
    ).toMatchObject({
      gradeLevel: 'onboarding.errors.grade_required',
    });
  });

  it('validates preference ranges and required selections', () => {
    const preferences = {
      dailySessionMinutes: { min: 0, max: 0 },
      gradeRange: { min: 6, max: 10 },
      subjects: [],
      learningGoals: [],
    };

    expect(Object.keys(validateOnboardingPreferences(preferences, t))).toEqual([
      'minAgeRange',
      'maxAgeRange',
      'subjects',
      'goals',
    ]);
    expect(
      validateOnboardingPreferences(
        {
          ...preferences,
          dailySessionMinutes: { min: 30, max: 60 },
          subjects: ['Mathematics'],
          learningGoals: ['Board exam preparation'],
        },
        t
      )
    ).toEqual({});
  });
});
