import { MatchCompatibilityService } from './match-compatibility.service';

describe('MatchCompatibilityService', () => {
  let service: MatchCompatibilityService;

  beforeEach(() => {
    service = new MatchCompatibilityService();
  });

  it.each([
    [{ visibilityScore: 72, profileScore: 60 }, 72],
    [{ profileScore: 61 }, 61],
    [{}, 50],
  ])('uses profile quality fallback without preferences', (profile, score) => {
    expect(service.scoreProfileAgainstPreference(profile, null)).toEqual({
      score,
      signals: [],
    });
  });

  it('returns a neutral score when no preference filters produce signals', () => {
    expect(service.scoreProfileAgainstPreference({}, {})).toEqual({
      score: 50,
      signals: [],
    });
  });

  it('scores all supported preference signals with defaults', () => {
    const result = service.scoreProfileAgainstPreference(
      {
        age: 30,
        physical: { height: 170 },
        personal: {
          religion: 'Hindu',
          caste: 'Sharma',
          city: 'Pune',
          state: 'MH',
          country: 'IN',
          smoking: 'never',
          drinking: 'socially',
          eating: 'vegetarian',
          manglikStatus: 'non_manglik',
        },
        education: { occupationType: 'Engineer' },
      },
      {
        filters: {
          age: { min: 25, max: 35 },
          height: { min: 180 },
          religion: ['Hindu', null],
          caste: ['Other'],
          city: [],
          state: ['MH'],
          country: ['IN'],
          qualification: ['Graduate'],
          occupationType: ['Engineer'],
          smoking: ['never'],
          drinking: ['never'],
          eating: [],
          manglikStatus: ['manglik'],
        },
      },
    );

    expect(result.signals).toEqual([
      { key: 'age', matched: true, weight: 10 },
      { key: 'height', matched: false, weight: 10 },
      { key: 'religion', matched: true, weight: 15 },
      { key: 'caste', matched: false, weight: 10 },
      { key: 'location', matched: true, weight: 10 },
      { key: 'occupation', matched: true, weight: 10 },
      { key: 'lifestyle', matched: true, weight: 10 },
      { key: 'horoscope', matched: false, weight: 15 },
    ]);
    expect(result.score).toBe(61);
  });

  it('supports default range boundaries and country location fallback', () => {
    const result = service.scoreProfileAgainstPreference(
      { age: 30, personal: { country: 'IN' } },
      {
        filters: {
          age: { max: 35 },
          city: [],
          state: [],
          country: ['IN'],
        },
        weights: {
          age: 1,
          height: 0,
          religion: 0,
          caste: 0,
          location: 1,
          education: 0,
          occupation: 0,
          lifestyle: 0,
          horoscope: 0,
        },
      },
    );

    expect(result.score).toBe(100);
    expect(result.signals).toEqual([
      { key: 'age', matched: true, weight: 1 },
      { key: 'location', matched: true, weight: 1 },
    ]);
  });

  it('rejects a value above a maximum-only range', () => {
    const result = service.scoreProfileAgainstPreference(
      { age: 30 },
      {
        filters: { age: { max: 25 } },
        weights: {
          age: 1,
          height: 0,
          religion: 0,
          caste: 0,
          location: 0,
          education: 0,
          occupation: 0,
          lifestyle: 0,
          horoscope: 0,
        },
      },
    );

    expect(result.score).toBe(0);
  });

  it('accepts a value above a minimum-only range', () => {
    const result = service.scoreProfileAgainstPreference(
      { age: 30 },
      {
        filters: { age: { min: 25 } },
        weights: {
          age: 1,
          height: 0,
          religion: 0,
          caste: 0,
          location: 0,
          education: 0,
          occupation: 0,
          lifestyle: 0,
          horoscope: 0,
        },
      },
    );

    expect(result.score).toBe(100);
  });

  it('ignores invalid ranges, absent lists and invalid nested paths', () => {
    const result = service.scoreProfileAgainstPreference(
      { age: 'unknown', physical: 'invalid', personal: { religion: null } },
      {
        filters: {
          age: { min: 20 },
          height: { min: 150, max: 200 },
          religion: ['Hindu'],
          caste: 'not-a-list',
          smoking: [],
        },
      },
    );

    expect(result).toEqual({ score: 50, signals: [] });
  });

  it('scores a lifestyle mismatch below the majority threshold', () => {
    const result = service.scoreProfileAgainstPreference(
      { personal: { smoking: 'yes' } },
      {
        filters: { smoking: ['no'] },
        weights: {
          age: 0,
          height: 0,
          religion: 0,
          caste: 0,
          location: 0,
          education: 0,
          occupation: 0,
          lifestyle: 5,
          horoscope: 0,
        },
      },
    );

    expect(result).toEqual({
      score: 0,
      signals: [{ key: 'lifestyle', matched: false, weight: 5 }],
    });
  });

  it('calculates rounded mutual compatibility in both directions', () => {
    const result = service.calculateMutualCompatibility(
      { age: 40 },
      { filters: { age: { min: 20, max: 30 } } },
      { age: 25 },
      { filters: { age: { min: 35, max: 45 } } },
    );

    expect(result).toMatchObject({
      score: 100,
      myPreferenceScore: 100,
      theirPreferenceScore: 100,
    });
  });
});
