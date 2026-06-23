import { ProfileScoringService } from './profile-scoring.service';

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
        personal: {
          profileFor: 'self',
          firstName: 'Asha',
          gender: 'female',
          dateOfBirth: '1995-01-01',
          religion: 'hindu',
          maritalStatus: 'never_married',
          aboutMe: 'A thoughtful profile',
          personalityBadges: ['kind', 'curious', 'family_oriented'],
        },
        physical: { height: 165 },
        education: {
          qualification: 'masters',
          occupation: 'engineer',
          annualIncomeAmount: 1500000,
        },
        family: { familyType: 'nuclear' },
        isVerified: true,
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
});
