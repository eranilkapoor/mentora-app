import { ProfileScoringService } from './profile-scoring.service';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';

describe('ProfileScoringService', () => {
  const service = new ProfileScoringService();

  it('reports missing fields for an incomplete profile', () => {
    const result = service.calculate({
      personal: { firstName: 'Asha' },
    });

    expect(result.profileCompletionPercentage).toBeLessThan(20);
    expect(result.missingFields).toEqual(
      expect.arrayContaining([
        'profileFor',
        'gender',
        'dateOfBirth',
        'profilePhoto',
      ]),
    );
    expect(result.profileScore).toBeGreaterThanOrEqual(0);
    expect(result.visibilityScore).toBeGreaterThanOrEqual(0);
  });

  it('rewards complete, verified, premium, media-rich, recently active profiles', () => {
    const result = service.calculate(
      {
        profileFor: 'self',
        personal: {
          firstName: 'Asha',
          gender: 'female',
          dateOfBirth: '1995-01-01',
          religion: 'hindu',
          maritalStatus: 'never_married',
          motherTongue: 'Hindi',
          country: 'IN',
          state: 'Maharashtra',
          city: 'Mumbai',
          smoking: 'non_smoker',
          drinking: 'non_drinker',
          eating: 'vegetarian',
          aboutMe:
            'A thoughtful, family-oriented professional who values kindness, mutual respect, and a balanced modern lifestyle.',
          personalityBadges: ['kind', 'curious', 'family_oriented'],
        },
        physical: { height: 165, bodyType: 'average' },
        education: {
          qualification: 'masters',
          occupationType: 'private_sector',
          occupation: 'engineer',
          annualIncomeAmount: 1500000,
        },
        family: {
          familyType: 'nuclear',
          familyStatus: 'middle_class',
          familyValues: 'moderate',
        },
        verificationStatus: VerificationStatus.APPROVED,
        isPremium: true,
        lastActiveAt: new Date(),
      },
      { imageCount: 4, videoCount: 1 },
    );

    expect(result.profileCompletionPercentage).toBe(100);
    expect(result.profileScore).toBe(100);
    expect(result.visibilityScore).toBeGreaterThanOrEqual(90);
    expect(result.missingFields).toEqual([]);
  });

  it('supports a completely empty profile and default media input', () => {
    const result = service.calculate({});

    expect(result.profileCompletionPercentage).toBe(0);
    expect(result.missingFields).toHaveLength(24);
  });

  it.each([
    [3, 6],
    [10, 2],
    [40, 0],
  ])(
    'applies the expected activity bonus after %s inactive days',
    (days, bonus) => {
      const now = new Date('2026-06-29T00:00:00.000Z').getTime();
      const dateNow = jest.spyOn(Date, 'now').mockReturnValue(now);
      const baseline = service.calculate({ lastActiveAt: undefined });
      const result = service.calculate({
        lastActiveAt: new Date(now - days * 24 * 60 * 60 * 1000),
      });

      expect(result.visibilityScore - baseline.visibilityScore).toBe(bonus - 2);
      dateNow.mockRestore();
    },
  );
});
