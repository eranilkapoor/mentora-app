import { normalizeSiblings } from './siblings.utils';

describe('normalizeSiblings', () => {
  it('derives married counts from detail selections', () => {
    const result = normalizeSiblings({
      brothersCount: 1,
      sistersCount: 1,
      marriedBrothersCount: 0,
      marriedSistersCount: 0,
      details: [
        { type: 'brother', married: true, occupation: 'Doctor' },
        { type: 'sister', married: false, occupation: 'Engineer' },
      ],
    });

    expect(result.marriedBrothersCount).toBe(1);
    expect(result.marriedSistersCount).toBe(0);
  });

  it('removes stale married details when counts become zero', () => {
    const result = normalizeSiblings({
      brothersCount: 0,
      sistersCount: 0,
      marriedBrothersCount: 1,
      marriedSistersCount: 1,
      details: [
        { type: 'brother', married: true, occupation: 'Doctor' },
        { type: 'sister', married: true, occupation: 'Engineer' },
      ],
    });

    expect(result.details).toEqual([]);
    expect(result.marriedBrothersCount).toBe(0);
    expect(result.marriedSistersCount).toBe(0);
  });

  it('creates safe unmarried details when counts increase', () => {
    const result = normalizeSiblings({
      brothersCount: 2,
      sistersCount: 0,
      marriedBrothersCount: 0,
      marriedSistersCount: 0,
      details: [],
    });

    expect(result.details).toEqual([
      { type: 'brother', married: false, occupation: '' },
      { type: 'brother', married: false, occupation: '' },
    ]);
  });
});
