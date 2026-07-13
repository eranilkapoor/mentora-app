import {
  Countries,
  Genders,
  MaritalStatuses,
  ProfileFors,
  Qualifications,
  Religions,
} from '@/core/types';
import {
  validateOnboardingBasic,
  validateOnboardingPreferences,
} from './onboardingForm.utils';

const t = ((key: string) => key) as never;

describe('onboarding form validation', () => {
  it('reports every required basic field and accepts a complete profile', () => {
    const basic = {
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

    expect(validateOnboardingBasic(basic, t)).toEqual({
      firstName: 'onboarding.errors.first_name_required',
      dateOfBirth: 'onboarding.errors.date_of_birth_required',
      height: 'onboarding.errors.height_required',
      occupation: 'onboarding.errors.occupation_required',
    });
    expect(
      validateOnboardingBasic(
        {
          ...basic,
          firstName: 'Asha',
          dateOfBirth: '1995-04-12',
          height: '165',
          occupation: 'Engineer',
        },
        t
      )
    ).toEqual({});

    expect(
      validateOnboardingBasic({ ...basic, firstName: 'Asha', height: 'abc' }, t)
    ).toMatchObject({
      height: 'onboarding.errors.height_invalid',
    });
  });

  it('validates preference ranges and required selections', () => {
    const preferences = {
      ageRange: { min: 0, max: 0 },
      heightRange: { min: 155, max: 180 },
      maritalStatus: [],
      religion: [],
      country: [],
    };

    expect(Object.keys(validateOnboardingPreferences(preferences, t))).toEqual([
      'minAgeRange',
      'maxAgeRange',
      'maritalStatusPreference',
      'religionPreference',
      'locationPreference',
    ]);
    expect(
      validateOnboardingPreferences(
        {
          ...preferences,
          ageRange: { min: 25, max: 32 },
          maritalStatus: [MaritalStatuses.NEVER_MARRIED],
          religion: [Religions.HINDU],
          country: [Countries.INDIA],
        },
        t
      )
    ).toEqual({});
  });
});
